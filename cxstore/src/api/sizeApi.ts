import { activateCommonItem, createCommonItem, deactivateCommonItem, getCommonItemById, listCommonItems, updateCommonItem } from "@/api/commonApi"
import type { NameMasterUpsertRequest } from "@/types/common"

const path = "/common/sizes"

export function listSizes() {
  return listCommonItems(path)
}

export function getSizeById(id: number) {
  return getCommonItemById(path, id)
}

export function createSize(request: NameMasterUpsertRequest) {
  return createCommonItem(path, request)
}

export function updateSize(id: number, request: NameMasterUpsertRequest) {
  return updateCommonItem(path, id, request)
}

export function deleteSize(id: number) {
  return deactivateCommonItem(path, id)
}

export function restoreSize(id: number) {
  return activateCommonItem(path, id)
}
