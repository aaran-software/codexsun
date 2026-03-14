import { activateCommonItem, createCommonItem, deactivateCommonItem, getCommonItemById, listCommonItems, updateCommonItem } from "@/api/commonApi"
import type { HsnCodeUpsertRequest } from "@/types/common"

const path = "/common/hsn-codes"

export function listHsnCodes() {
  return listCommonItems(path)
}

export function getHsnCodeById(id: number) {
  return getCommonItemById(path, id)
}

export function createHsnCode(request: HsnCodeUpsertRequest) {
  return createCommonItem(path, request)
}

export function updateHsnCode(id: number, request: HsnCodeUpsertRequest) {
  return updateCommonItem(path, id, request)
}

export function deleteHsnCode(id: number) {
  return deactivateCommonItem(path, id)
}

export function restoreHsnCode(id: number) {
  return activateCommonItem(path, id)
}
