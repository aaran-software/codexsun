import { activateCommonItem, createCommonItem, deactivateCommonItem, getCommonItemById, listCommonItems, updateCommonItem } from "@/api/commonApi"
import type { UnitUpsertRequest } from "@/types/common"

const path = "/common/units"

export function listUnits() {
  return listCommonItems(path)
}

export function getUnitById(id: number) {
  return getCommonItemById(path, id)
}

export function createUnit(request: UnitUpsertRequest) {
  return createCommonItem(path, request)
}

export function updateUnit(id: number, request: UnitUpsertRequest) {
  return updateCommonItem(path, id, request)
}

export function deleteUnit(id: number) {
  return deactivateCommonItem(path, id)
}

export function restoreUnit(id: number) {
  return activateCommonItem(path, id)
}
