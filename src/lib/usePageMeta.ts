import { useEffect } from 'react'

const SITE_URL = 'https://genegladiator.github.io/bev-issue-tracker'
const SITE_NAME = 'BEV Owners Issue Tracker'

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(path: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', `${SITE_URL}${path}`)
}

/**
 * Sets the document title, meta description, canonical URL, and Open Graph /
 * Twitter Card tags for the current route. React Router is a client-side SPA
 * with a single static index.html, so per-page SEO metadata has to be pushed
 * into the document imperatively rather than declared in JSX.
 */
export function usePageMeta({
  title,
  description,
  path,
  image = 'images/hero.png',
}: {
  title: string
  description: string
  path: string
  image?: string
}) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`
    document.title = fullTitle

    setMetaTag('name', 'description', description)
    setCanonical(path)

    const imageUrl = `${SITE_URL}/${image}`
    setMetaTag('property', 'og:title', fullTitle)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:url', `${SITE_URL}${path}`)
    setMetaTag('property', 'og:image', imageUrl)
    setMetaTag('property', 'og:type', 'website')
    setMetaTag('property', 'og:site_name', SITE_NAME)
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', fullTitle)
    setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', imageUrl)
  }, [title, description, path, image])
}
