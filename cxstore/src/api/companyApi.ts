import { requestJson } from "@/api/httpClient"
import type { CompanyProfile, CompanySetting, CompanySettingsUpdateRequest, CompanyUpdateRequest } from "@/types/company"

export function getCompany() {
  return requestJson<CompanyProfile>("/company", { method: "GET" }, { auth: false })
}

export function updateCompany(request: CompanyUpdateRequest) {
  return requestJson<CompanyProfile>("/company", {
    method: "PUT",
    body: JSON.stringify(request),
  })
}

export function getCompanySettings() {
  return requestJson<CompanySetting[]>("/company/settings", { method: "GET" })
}

export function updateCompanySettings(request: CompanySettingsUpdateRequest) {
  return requestJson<CompanySetting[]>("/company/settings", {
    method: "PUT",
    body: JSON.stringify(request),
  })
}
