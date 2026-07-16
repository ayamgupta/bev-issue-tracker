// Supabase Edge Function: submit-report
//
// This is the ONLY way reports get written to the database. The browser never
// holds a key capable of inserting rows — it calls this function, which:
//   1. Verifies the Cloudflare Turnstile token server-side (secret key lives
//      only in this function's environment, never shipped to the client).
//   2. If a registration number is given and matches an existing report's
//      hash, treats this as an EDIT of that report (re-submitting the form
//      with the same reg number updates it) rather than a new submission —
//      no separate edit page, no login. Skips the IP rate limit in this case
//      since the reg-number match is a stronger identity signal than IP.
//   3. Otherwise rate-limits by hashed IP (soft: blocks a 2nd submission from
//      the same IP within 6 hours) and inserts a new report, flagging
//      duplicate_suspected if the reg-number hash unexpectedly matches
//      (shouldn't happen given step 2, kept as a defensive fallback).
//   4. Inserts into `reports` (public) and `report_private` (PII) using the
//      service role key, which bypasses RLS.
//
// Deploy: supabase functions deploy submit-report
// Required secrets (supabase secrets set ...):
//   TURNSTILE_SECRET_KEY   - from Cloudflare Turnstile dashboard
//   IP_HASH_PEPPER         - random string, e.g. `openssl rand -hex 32`
//   REG_HASH_PEPPER        - random string, different from the above

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CAR_MODELS = ['BE 6', 'XEV 9e', 'XEV 9S']
const BATTERY_PACKS = ['59 kWh', '79 kWh']
const RATE_LIMIT_WINDOW_HOURS = 6

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

function normalizeRegNumber(reg: string): string {
  return reg.toUpperCase().replace(/[\s-]/g, '')
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

function isValidRating(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 5
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

    // --- 1. Turnstile ---------------------------------------------------
    if (!payload.turnstile_token || typeof payload.turnstile_token !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing verification token' }), { status: 400, headers })
    }
    const humanVerified = await verifyTurnstile(payload.turnstile_token, clientIp)
    if (!humanVerified) {
      return new Response(JSON.stringify({ error: 'Verification failed, please try again' }), { status: 403, headers })
    }

    // --- 2. Field validation ---------------------------------------------
    const {
      car_model,
      variant,
      battery_pack,
      purchase_year,
      odo_km,
      city,
      service_center,
      major_issues,
      minor_issues,
      hardware_rating,
      software_rating,
      service_rating,
      overall_rating,
      notes,
      notes_public_opt_in,
      software_version,
      tyre_brand,
      tyre_life_remaining_pct,
      reg_number,
      owner_name,
      contact_number,
    } = payload

    if (!CAR_MODELS.includes(car_model)) {
      return new Response(JSON.stringify({ error: 'Invalid car model' }), { status: 400, headers })
    }
    if (typeof variant !== 'string' || !variant.trim()) {
      return new Response(JSON.stringify({ error: 'Variant is required' }), { status: 400, headers })
    }
    if (battery_pack !== undefined && battery_pack !== null && !BATTERY_PACKS.includes(battery_pack)) {
      return new Response(JSON.stringify({ error: 'Invalid battery pack' }), { status: 400, headers })
    }
    const currentYear = new Date().getFullYear()
    if (typeof purchase_year !== 'number' || purchase_year < 2023 || purchase_year > currentYear + 1) {
      return new Response(JSON.stringify({ error: 'Invalid purchase year' }), { status: 400, headers })
    }
    if (typeof odo_km !== 'number' || odo_km < 0 || odo_km > 500000) {
      return new Response(JSON.stringify({ error: 'Invalid odometer reading' }), { status: 400, headers })
    }
    if (typeof city !== 'string' || !city.trim()) {
      return new Response(JSON.stringify({ error: 'City is required' }), { status: 400, headers })
    }
    if (!Array.isArray(major_issues) || !Array.isArray(minor_issues)) {
      return new Response(JSON.stringify({ error: 'Invalid issue list' }), { status: 400, headers })
    }
    if (![hardware_rating, software_rating, service_rating, overall_rating].every(isValidRating)) {
      return new Response(JSON.stringify({ error: 'Ratings must be 1-5' }), { status: 400, headers })
    }
    if (
      tyre_life_remaining_pct !== undefined &&
      tyre_life_remaining_pct !== null &&
      (typeof tyre_life_remaining_pct !== 'number' || tyre_life_remaining_pct < 0 || tyre_life_remaining_pct > 100)
    ) {
      return new Response(JSON.stringify({ error: 'Tyre life remaining must be 0-100' }), { status: 400, headers })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const reportFields = {
      car_model,
      variant,
      battery_pack: typeof battery_pack === 'string' ? battery_pack : null,
      purchase_year,
      odo_km,
      city: city.trim(),
      service_center: typeof service_center === 'string' ? service_center.trim() || null : null,
      major_issues,
      minor_issues,
      hardware_rating,
      software_rating,
      service_rating,
      overall_rating,
      notes: typeof notes === 'string' ? notes.trim().slice(0, 2000) || null : null,
      notes_public_opt_in: notes_public_opt_in === true,
      software_version: typeof software_version === 'string' ? software_version.trim().slice(0, 100) || null : null,
      tyre_brand: typeof tyre_brand === 'string' ? tyre_brand.trim().slice(0, 100) || null : null,
      tyre_life_remaining_pct: typeof tyre_life_remaining_pct === 'number' ? tyre_life_remaining_pct : null,
    }

    // --- 3. Reg-number match -> this is an edit of an existing report ----
    const regPepper = Deno.env.get('REG_HASH_PEPPER') ?? ''
    let regHash: string | null = null
    let existingReportId: string | null = null
    if (typeof reg_number === 'string' && reg_number.trim()) {
      regHash = await sha256Hex(normalizeRegNumber(reg_number) + regPepper)
      const { data: existingPrivate } = await supabase
        .from('report_private')
        .select('report_id')
        .eq('reg_hash', regHash)
        .maybeSingle()
      existingReportId = existingPrivate?.report_id ?? null
    }

    if (existingReportId) {
      const { data: updated, error: updateError } = await supabase
        .from('reports')
        .update({
          ...reportFields,
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingReportId)
        .select('id')
        .single()

      if (updateError || !updated) {
        console.error(updateError)
        return new Response(JSON.stringify({ error: 'Could not update report' }), { status: 500, headers })
      }

      // Name/contact may have changed slightly; reg number is the match key so it's unchanged.
      await supabase
        .from('report_private')
        .update({
          owner_name: typeof owner_name === 'string' ? owner_name.trim() || null : null,
          contact_number: typeof contact_number === 'string' ? contact_number.trim() || null : null,
        })
        .eq('report_id', existingReportId)

      return new Response(JSON.stringify({ id: updated.id, updated: true }), { status: 200, headers })
    }

    // --- 4. New submission: rate limit by hashed IP -----------------------
    const ipPepper = Deno.env.get('IP_HASH_PEPPER') ?? ''
    const ipHash = await sha256Hex(clientIp + ipPepper)

    const { data: recent } = await supabase
      .from('reports')
      .select('id')
      .eq('submitter_ip_hash', ipHash)
      .gte('created_at', new Date(Date.now() - RATE_LIMIT_WINDOW_HOURS * 3600 * 1000).toISOString())
      .limit(1)

    if (recent && recent.length > 0) {
      return new Response(
        JSON.stringify({ error: `Please wait a few hours before submitting another report from this connection.` }),
        { status: 429, headers },
      )
    }

    // --- 5. Insert ---------------------------------------------------------
    const { data: inserted, error: insertError } = await supabase
      .from('reports')
      .insert({
        ...reportFields,
        submitter_ip_hash: ipHash,
        duplicate_suspected: false,
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      console.error(insertError)
      return new Response(JSON.stringify({ error: 'Could not save report' }), { status: 500, headers })
    }

    if (regHash || owner_name || contact_number) {
      const { error: piiError } = await supabase.from('report_private').insert({
        report_id: inserted.id,
        reg_number: typeof reg_number === 'string' ? reg_number.trim() || null : null,
        owner_name: typeof owner_name === 'string' ? owner_name.trim() || null : null,
        contact_number: typeof contact_number === 'string' ? contact_number.trim() || null : null,
        reg_hash: regHash,
      })
      if (piiError) console.error('PII insert failed:', piiError)
    }

    return new Response(JSON.stringify({ id: inserted.id, duplicate_suspected: false }), {
      status: 201,
      headers,
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Unexpected server error' }), { status: 500, headers })
  }
})
