/**
 * API de items.
 *
 * Contrato de filtros (adaptado al schema del backend):
 *
 *   POST /items/search
 *   Body: {
 *     "filters": {
 *       "filters": [
 *         { "field": "status", "operator": "=", "value": "pending" },
 *         { "field": "warehouse_id", "operator": "in", "value": [1, 2] }
 *       ]
 *     }
 *   }
 *
 * El campo `operator` usa los símbolos del Enum FilterOperator del backend:
 *   "=", "!=", ">", "<", "like", "in", "is null"
 *
 * GET /items/{id}/status/{new_status}
 *   Cambia el estado de un item. Devuelve ItemOut o { success: false, error: string }.
 */

import { apiFetch } from './client.ts'

// --- Tipos ---------------------------------------------------------------

export type FilterField = 'id' | 'sku' | 'status' | 'warehouse_id' | 'created_at'

export type FilterOperator = '=' | '!=' | '>' | '<' | 'like' | 'in' | 'is null'

export const FIELD_LABELS: Record<FilterField, string> = {
  id:           'ID',
  sku:          'SKU',
  status:       'Estado',
  warehouse_id: 'Almacén',
  created_at:   'Fecha creación',
}

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  '=':       'igual a',
  '!=':      'distinto de',
  '>':       'mayor que',
  '<':       'menor que',
  'like':    'contiene',
  'in':      'en lista',
  'is null': 'está vacío',
}

// Operadores que no necesitan value
export const VALUELESS_OPERATORS: FilterOperator[] = ['is null']
// Operadores que esperan un array (el usuario escribe "a,b,c" y lo convertimos)
export const LIST_OPERATORS: FilterOperator[] = ['in']

export interface FilterCondition {
  field: FilterField
  operator: FilterOperator
  // Para 'in' el backend espera un array; para 'is null' espera null/undefined
  value?: string | number | string[] | null
}

export interface ItemOut {
  id: number
  sku: string
  status: string
  warehouse_id: number
}

export const VALID_STATUSES = ['pending', 'done', 'cancelled'] as const
export type ItemStatus = (typeof VALID_STATUSES)[number]

// --- Funciones -----------------------------------------------------------

export async function searchItems(filters: FilterCondition[]): Promise<ItemOut[]> {
  return apiFetch<ItemOut[]>('/items/search', {
    method: 'POST',
    body: JSON.stringify({
      // El backend espera { filters: { filters: [...] } }
      // (SearchRequest.filters: ItemSearchFilters)
      filters: { filters: filters },
    }),
  })
}

export async function setItemStatus(
  itemId: number,
  newStatus: string,
): Promise<ItemOut> {
  // El endpoint original es GET (no PUT/PATCH) según el enunciado
  return apiFetch<ItemOut>(`/items/${itemId}/status/${newStatus}`, {
    method: 'GET',
  })
}