// Supabase Edge Function: submit-tip
//
// Writes to `community_tips` — short, free-text "issue + fix" submissions shown
// on the Known Issues page. Lower-friction than submit-report (no reg number,
// no ownership verification), so this function leans harder on abuse controls:
//   1. Cloudflare Turnstile verification (same site key as submit-report).
//   2. Rate limit by hashed IP: max 3 tips per IP per rolling 24h.
//   3. Length caps on both fields, applied server-side (never trust the client).
//
// Deploy: supabase functions deploy submit-tip
// Required secrets: same as submit-report (TURNSTILE_SECRET_KEY, IP_HASH_PEPPER)

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CAR_MODELS = ['BE 6', 'XEV 9e', 'XEV 9S']
const RATE_LIMIT_WINDOW_HOURS = 24
const RATE_LIMIT_MAX_TIPS = 3
const ISSUE_MAX_LEN = 150
const FIX_MAX_LEN = 800

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function verifyTurnstile(token: string, remoteIp: string): Promise<boolean> {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY')
  if (!secret) throw new Error('TURNSTILE_SECRET_KEY not configured')

  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', token)
  body.set('remoteip', remoteIp)

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  })
  const json = await res.json()
  return json.success === true
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const headers = { ...corsHeaders(origin), 'Content-Type': 'application/json' }

  if (req.method === 'OPTIONS') return new Response('ok', { headers })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
  }

  try {
    const payload = await req.json()
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('cf-connecting-ip') ??
      '0.0.0.0'

    if (!payload.turnstile_token || typeof payload.turnstile_token !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing verification token' }), { status: 400, headers })
    }
    const humanVerified = await verifyTurnstile(payload.turnstile_token, clientIp)
    if (!humanVerified) {
      return new Response(JSON.stringify({ error: 'Verification failed, please try again' }), { status: 403, headers })
    }

    const { car_model, issue, fix } = payload

    if (car_model !== undefined && car_model !== null && !CAR_MODELS.includes(car_model)) {
      return new Response(JSON.stringify({ error: 'Invalid car model' }), { status: 400, headers })
    }
    if (typeof issue !== 'string' || !issue.trim()) {
      return new Response(JSON.stringify({ error: 'Issue is required' }), { status: 400, headers })
    }
    if (typeof fix !== 'string' || !fix.trim()) {
      return new Response(JSON.stringify({ error: 'Fix / workaround is required' }), { status: 400, headers })
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const ipPepper = Deno.env.get('IP_HASH_PEPPER') ?? ''
    const ipHash = await sha256Hex(clientIp + ipPepper)

    const { data: recent } = await supabase
      .from('community_tips')
      .select('id')
      .eq('submitter_ip_hash', ipHash)
      .gte('created_at', new Date(Date.now() - RATE_LIMIT_WINDOW_HOURS * 3600 * 1000).toISOString())

    if (recent && recent.length >= RATE_LIMIT_MAX_TIPS) {
      return new Response(
        JSON.stringify({ error: 'Please wait a while before submitting another tip from this connection.' }),
        { status: 429, headers },
      )
    }

    const { data: inserted, error: insertError } = await supabase
      .from('community_tips')
      .insert({
        car_model: typeof car_model === 'string' ? car_model : null,
        issue: issue.trim().slice(0, ISSUE_MAX_LEN),
        fix: fix.trim().slice(0, FIX_MAX_LEN),
        submitter_ip_hash: ipHash,
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      console.error(insertError)
      return new Response(JSON.stringify({ error: 'Could not save tip' }), { status: 500, headers })
    }

    return new Response(JSON.stringify({ id: inserted.id }), { status: 201, headers })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Unexpected server error' }), { status: 500, headers })
  }
})
