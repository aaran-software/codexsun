import { activateCommonItem, createCommonItem, deactivateCommonItem, getCommonItemById, listCommonItems, updateCommonItem } from "@/api/commonApi"
import type { CommonMasterItem, NameMasterUpsertRequest } from "@/types/common"

const path = "/common/brands"

export function listBrands() {
  return listCommonItems(path)
}

export function getBrandById(id: number) {
  return getCommonItemById(path, id)
}

export function createBrand(request: NameMasterUpsertRequest) {
  return createCommonItem(path, request)
}

export function updateBrand(id: number, request: NameMasterUpsertRequest) {
  return updateCommonItem(path, id, request)
}

export function deleteBrand(id: number) {
  return deactivateCommonItem(path, id)
}

export function restoreBrand(id: number) {
  return activateCommonItem(path, id)
}

export type { CommonMasterItem }
