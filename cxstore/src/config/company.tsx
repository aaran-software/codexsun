import { createContext, useContext, useEffect, useMemo, useState } from "react"

import { getCompany } from "@/api/companyApi"
import type { CompanyProfile } from "@/types/company"

type CompanyContextValue = {
  company: CompanyProfile
  isLoaded: boolean
  reloadCompany: () => Promise<void>
}

const fallbackCompany: CompanyProfile = {
  id: 1,
  displayName: "CXStore",
  legalName: "CXStore Platform Private Limited",
  billingName: "CXStore Platform Private Limited",
  companyCode: "CXSTORE",
  email: "hello@cxstore.local",
  phone: "+91 00000 00000",
  website: "https://cxstore.local",
  supportEmail: "support@cxstore.local",
  gstNumber: "",
  panNumber: "",
  logoMediaId: null,
  logoUrl: "/Aspire.png",
  faviconMediaId: null,
  faviconUrl: "/favicon.ico",
  currencyId: 2,
  currencyName: "INR",
  currencyCode: "INR",
  timezone: "Asia/Calcutta",
  address: null,
  settings: [],
  createdAt: "",
  updatedAt: "",
}

const CompanyContext = createContext<CompanyContextValue>({
  company: fallbackCompany,
  isLoaded: false,
  reloadCompany: async () => {},
})

function updateFavicon(href: string) {
  if (typeof document === "undefined" || !href) {
    return
  }

  let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
  if (!link) {
    link = document.createElement("link")
    link.rel = "icon"
    document.head.appendChild(link)
  }

  link.href = href
}

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<CompanyProfile>(fallbackCompany)
  const [isLoaded, setIsLoaded] = useState(false)

  async function loadCompany() {
    try {
      const profile = await getCompany()
      setCompany({
        ...profile,
        logoUrl: profile.logoUrl || fallbackCompany.logoUrl,
        faviconUrl: profile.faviconUrl || fallbackCompany.faviconUrl,
      })
    } catch {
      setCompany(fallbackCompany)
    } finally {
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    void loadCompany()
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = company.displayName || fallbackCompany.displayName
    }
    updateFavicon(company.faviconUrl || fallbackCompany.faviconUrl)
  }, [company])

  const value = useMemo<CompanyContextValue>(() => ({
    company,
    isLoaded,
    reloadCompany: loadCompany,
  }), [company, isLoaded])

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
}

export function useCompanyConfig() {
  return useContext(CompanyContext)
}
