import { useEffect } from 'react'

const SCRIPT_ID = 'structured-data'

/**
 * Injects a JSON-LD <script> tag into <head> for the current page. Only one
 * at a time — each page owns the single script tag and replaces it on
 * mount/update, cleaning up on unmount so navigating away doesn't leave a
 * stale schema for the wrong page.
 */
export function useStructuredData(data: object | null) {
  useEffect(() => {
    if (!data) return

    let el = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (!el) {
      el = document.createElement('script')
      el.id = SCRIPT_ID
      el.type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(data)

    return () => {
      document.getElementById(SCRIPT_ID)?.remove()
    }
  }, [data])
}
