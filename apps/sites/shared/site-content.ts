type SiteNavItem = {
  label: string
  path: '/sites' | '/sites/about' | '/sites/service' | '/sites/contact'
}

type SiteService = {
  title: string
  description: string
}

const siteNavItems: readonly SiteNavItem[] = [
  { label: 'Home', path: '/sites' },
  { label: 'About', path: '/sites/about' },
  { label: 'Service', path: '/sites/service' },
  { label: 'Contact', path: '/sites/contact' },
]

const siteServices: readonly SiteService[] = [
  {
    title: 'Brand systems',
    description:
      'Build credible digital surfaces that align product story, visual identity, and conversion paths.',
  },
  {
    title: 'Performance web delivery',
    description:
      'Ship responsive, measurable pages with clear ownership between frontend and backend systems.',
  },
  {
    title: 'Operational handoff',
    description:
      'Make marketing pages maintainable with disciplined structure, health checks, and safe deployment paths.',
  },
]

const sitePortfolioContent = {
  brand: {
    name: 'Codexsun Studio',
    eyebrow: 'Portfolio Surface',
    heroTitle: 'Structured websites for serious businesses.',
    heroSummary:
      'The sites plugin keeps its own behavior, but its frontend and backend now start through the cxsun host.',
  },
  company: {
    summary:
      'We design and ship focused websites that stay readable in code, stable in runtime, and easy to operate after launch.',
    mission:
      'Give teams a clean first web surface while the wider ERP platform continues to grow behind it.',
  },
  contact: {
    email: 'hello@codexsun.local',
    phone: '+91 99999 99999',
    location: 'Surat, India',
  },
  navItems: siteNavItems,
  services: siteServices,
} as const

export { sitePortfolioContent, siteNavItems, siteServices }
export type { SiteNavItem, SiteService }
