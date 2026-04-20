type SiteHealth = {
  app: string
  status: 'ok'
  uptimeSeconds: number
}

type SitePayload = {
  content: {
    brand: {
      name: string
      eyebrow: string
      heroTitle: string
      heroSummary: string
    }
    company: {
      summary: string
      mission: string
    }
    contact: {
      email: string
      phone: string
      location: string
    }
    navItems: {
      label: string
      path: '/' | '/about' | '/service' | '/contact'
    }[]
    services: {
      title: string
      description: string
    }[]
  }
}

type ContactInput = {
  name: string
  email: string
  message: string
}

async function fetchSiteHealth() {
  const response = await fetch('/api/external/sites/health')

  if (!response.ok) {
    throw new Error('Unable to fetch backend health.')
  }

  return (await response.json()) as SiteHealth
}

async function fetchSitePayload() {
  const response = await fetch('/api/external/sites/site')

  if (!response.ok) {
    throw new Error('Unable to fetch site content.')
  }

  return (await response.json()) as SitePayload
}

async function submitContact(input: ContactInput) {
  const response = await fetch('/api/external/sites/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const payload = (await response.json()) as { status?: string; error?: string }

  if (!response.ok) {
    throw new Error(payload.error ?? 'Unable to submit contact form.')
  }

  return payload
}

export { fetchSiteHealth, fetchSitePayload, submitContact }
export type { ContactInput, SiteHealth, SitePayload }
