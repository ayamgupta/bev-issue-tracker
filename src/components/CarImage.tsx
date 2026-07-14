import { useState } from 'react'

interface CarImageProps {
  src: string
  alt: string
  className?: string
}

/**
 * Renders the product photo at `src` if present, otherwise falls back to a
 * clean gradient placeholder with the model name — so the site still looks
 * finished before real photos are dropped into /public/images.
 * See public/images/README.md for where to source official images.
 */
export function CarImage({ src, alt, className = '' }: CarImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-ink-800 to-brand-600 text-ink-100 ${className}`}
      >
        <span className="px-4 text-center text-sm font-medium tracking-wide opacity-80">{alt}</span>
      </div>
    )
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" />
}
