import { activateCommonItem, createCommonItem, deactivateCommonItem, getCommonItemById, listCommonItems, updateCommonItem } from "@/api/commonApi"
import type { NameMasterUpsertRequest } from "@/types/common"

const path = "/common/colours"

export function listColours() {
  return listCommonItems(path)
}

export function getColourById(id: number) {
  return getCommonItemById(path, id)
}

export function createColour(request: NameMasterUpsertRequest) {
  return createCommonItem(path, request)
}

export function updateColour(id: number, request: NameMasterUpsertRequest) {
  return updateCommonItem(path, id, request)
}

export function deleteColour(id: number) {
  return deactivateCommonItem(path, id)
}

export function restoreColour(id: number) {
  return activateCommonItem(path, id)
}
