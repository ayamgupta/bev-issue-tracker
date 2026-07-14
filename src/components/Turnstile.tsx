import { useEffect, useId, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void; 'error-callback'?: () => void; theme?: string },
      ) => string
      reset: (widgetId?: string) => void
    }
  }
}

const SCRIPT_ID = 'cf-turnstile-script'

function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.turnstile) return resolve()
    const existing = document.getElementById(SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      return
    }
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}

interface TurnstileProps {
  onVerify: (token: string) => void
  onExpire?: () => void
}

export function Turnstile({ onVerify, onExpire }: TurnstileProps) {
  const containerId = useId()
  const widgetIdRef = useRef<string | null>(null)
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

  useEffect(() => {
    let cancelled = false
    if (!siteKey) return

    loadTurnstileScript().then(() => {
      if (cancelled) return
      const container = document.getElementById(containerId)
      if (!container || !window.turnstile || widgetIdRef.current) return
      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: siteKey,
        callback: onVerify,
        'error-callback': onExpire,
      })
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey])

  if (!siteKey) {
    return (
      <p className="text-sm text-rose-500">
        Verification widget not configured (missing VITE_TURNSTILE_SITE_KEY).
      </p>
    )
  }

  return <div id={containerId} />
}
