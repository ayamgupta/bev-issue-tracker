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

async function main() {
  const server = await preview({ preview: { port: 4174, strictPort: true } })
  const base = server.config.base.replace(/\/$/, '')
  const origin = server.resolvedUrls.local[0].replace(/\/$/, '')

  const browser = await chromium.launch()
  const page = await browser.newPage()

  for (const route of ROUTES) {
    const url = `${origin}${base}${route}`
    // Not networkidle: the Turnstile widget and Supabase keep live connections
    // open, so the page never truly goes network-idle. `load` plus a fixed
    // settle delay is enough for the SPA's mount-time effects to commit.
    await page.goto(url, { waitUntil: 'load' })
    await page.waitForTimeout(1500)
    const html = `<!doctype html>\n${await page.evaluate(() => document.documentElement.outerHTML)}`

    const outDir = route === '/' ? 'dist' : path.join('dist', route.replace(/^\//, ''))
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, 'index.html'), html)
    console.log(`Prerendered ${route || '/'} -> ${outDir}/index.html`)
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
