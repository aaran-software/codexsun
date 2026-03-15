import { useEffect } from "react"

type PageMetaOptions = {
  title: string
  description?: string
  canonicalPath?: string
  structuredData?: Record<string, unknown>
}

function ensureMetaTag(name: string) {
  let element = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement("meta")
    element.setAttribute("name", name)
    document.head.appendChild(element)
  }

  return element
}

function ensureCanonical() {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement("link")
    link.rel = "canonical"
    document.head.appendChild(link)
  }

  return link
}

function ensureStructuredData() {
  let script = document.head.querySelector('script[data-codexsun-schema="page"]') as HTMLScriptElement | null
  if (!script) {
    script = document.createElement("script")
    script.type = "application/ld+json"
    script.dataset.codexsunSchema = "page"
    document.head.appendChild(script)
  }

  return script
}

export function usePageMeta({ title, description, canonicalPath, structuredData }: PageMetaOptions) {
  useEffect(() => {
    document.title = title

    if (description) {
      ensureMetaTag("description").content = description
    }

    if (canonicalPath) {
      ensureCanonical().href = `${window.location.origin}${canonicalPath}`
    }

    const script = ensureStructuredData()
    script.textContent = JSON.stringify(structuredData ?? {})

    return () => {
      if (!structuredData) {
        script.textContent = "{}"
      }
    }
  }, [canonicalPath, description, structuredData, title])
}
