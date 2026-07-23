// Prerenders each SPA route to a static dist/<route>/index.html so search
// crawlers (and social-link unfurl bots) get real content without executing
// JS. Runs a real headless Chromium against the built app rather than
// server-rendering the React tree in Node — the app assumes browser globals
// (window, document, Supabase client fetches in effects) throughout, so this
// avoids having to audit/rewrite every component for SSR-safety.
import { chromium } from 'playwright'
import { preview } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

const ROUTES = ['/', '/report', '/dashboard', '/resources', '/known-issues']

// A marker only present once Layout.tsx has actually rendered — confirms
// React mounted, as opposed to snapshotting the pre-hydration empty shell
// (which happened silently in CI: the fixed settle delay this used to rely
// on wasn't long enough on a colder/slower runner, and the script had no
// check to catch it, so it "succeeded" while shipping empty pages).
const MOUNT_MARKER = 'BEV Issue Tracker'

async function main() {
  const server = await preview({ preview: { port: 4174, strictPort: true } })
  const base = server.config.base.replace(/\/$/, '')
  const origin = server.resolvedUrls.local[0].replace(/\/$/, '')

  console.log(`Preview server base=${base} origin=${origin}`)

  const browser = await chromium.launch({ args: ['--no-sandbox'] })
  const page = await browser.newPage()
  page.on('pageerror', (err) => console.error('[page error]', err))
  page.on('console', (msg) => console.log(`[console ${msg.type()}]`, msg.text()))
  page.on('requestfailed', (req) => console.error('[request failed]', req.url(), req.failure()?.errorText))
  page.on('response', (res) => {
    if (!res.ok()) console.error('[bad response]', res.status(), res.url())
  })

  for (const route of ROUTES) {
    const url = `${origin}${base}${route}`
    console.log(`Navigating to ${url}`)
    const navResponse = await page.goto(url, { waitUntil: 'domcontentloaded' })
    console.log(`  document response: ${navResponse?.status()} ${navResponse?.url()}`)
    try {
      await page.waitForSelector('#root > *', { timeout: 20000 })
      await page.waitForFunction((marker) => document.body.textContent?.includes(marker), MOUNT_MARKER, {
        timeout: 20000,
      })
    } catch (err) {
      console.error(`  root HTML at failure time: ${(await page.content()).slice(0, 1000)}`)
      throw err
    }
    // Settle delay for effects (usePageMeta, Supabase data fetches) to
    // commit after the initial mount — long enough for typical REST query
    // latency, short enough to stay bounded (unlike networkidle, which
    // never resolves while Turnstile/Supabase keep live connections open).
    await page.waitForTimeout(3000)

    const html = `<!doctype html>\n${await page.evaluate(() => document.documentElement.outerHTML)}`

    if (!html.includes(MOUNT_MARKER) || html.length < 3000) {
      throw new Error(
        `Prerender sanity check failed for ${route}: captured HTML looks empty (${html.length} chars). ` +
          'The app likely never finished mounting before the snapshot.',
      )
    }

    const outDir = route === '/' ? 'dist' : path.join('dist', route.replace(/^\//, ''))
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, 'index.html'), html)
    console.log(`Prerendered ${route || '/'} -> ${outDir}/index.html (${html.length} chars)`)
  }

  await browser.close()
  await new Promise((resolve, reject) => {
    server.httpServer.close((err) => (err ? reject(err) : resolve()))
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
