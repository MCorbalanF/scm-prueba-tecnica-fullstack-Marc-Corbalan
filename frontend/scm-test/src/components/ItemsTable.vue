<script setup lang="ts">
/**
 * ItemsTable — muestra los ítems y permite cambiar su estado inline.
 *
 * Cada fila tiene un select de estado. Al cambiar, llama a setItemStatus
 * y actualiza la fila optimistamente (si falla, revierte y muestra error).
 */

import { ref } from 'vue'
import { type ItemOut, VALID_STATUSES, setItemStatus } from '../api/items'
import { ApiError } from '../api/client'
import { useToast } from '../composables/useToast'

const props = defineProps<{
  items: ItemOut[]
  loading: boolean
}>()

const emit = defineEmits<{
  statusChanged: [item: ItemOut]
}>()

const { success, error: showError } = useToast()

// Mapa de items en proceso de actualización para mostrar estado de carga por fila
const updatingIds = ref(new Set<number>())

const STATUS_LABELS: Record<string, string> = {
  pending:   'Pendiente',
  done:      'Completado',
  cancelled: 'Cancelado',
}

function statusClass(status: string): string {
  const map: Record<string, string> = {
    pending:   'badge-pending',
    done:      'badge-done',
    cancelled: 'badge-cancelled',
  }
  return map[status] ?? 'badge-unknown'
}

async function onStatusChange(item: ItemOut, newStatus: string) {
  if (newStatus === item.status) return

  const prevStatus = item.status
  updatingIds.value.add(item.id)

  // Actualización optimista: cambiamos el status localmente de inmediato
  item.status = newStatus

  try {
    const updated = await setItemStatus(item.id, newStatus)
    item.status = updated.status
    success(`SKU ${item.sku} → ${STATUS_LABELS[newStatus] ?? newStatus}`)
    emit('statusChanged', updated)
  } catch (err) {
    // Revertir si falla
    item.status = prevStatus
    if (err instanceof ApiError) {
      showError(`Error al cambiar estado: ${err.message}`)
    } else {
      showError('Error de conexión.')
    }
  } finally {
    updatingIds.value.delete(item.id)
  }
}
</script>

<template>
  <div class="table-wrap">
    <!-- Estado: cargando -->
    <div v-if="loading" class="table-overlay">
      <div class="spinner spinner-lg"></div>
      <span class="muted">Buscando ítems…</span>
    </div>

    <!-- Estado: sin resultados -->
    <div v-else-if="!loading && items.length === 0" class="table-empty">
      <span class="empty-icon">◎</span>
      <p>No hay ítems que coincidan con los filtros.</p>
      <p class="muted">Prueba a ajustar o limpiar los filtros.</p>
    </div>

    <!-- Tabla -->
    <table v-else class="table">
      <thead>
        <tr>
          <th class="col-id">ID</th>
          <th class="col-sku">SKU</th>
          <th class="col-status">Estado</th>
          <th class="col-wh">Almacén</th>
          <th class="col-actions">Cambiar estado</th>
        </tr>
      </thead>
      <TransitionGroup name="row" tag="tbody">
        <tr
          v-for="item in items"
          :key="item.id"
          :class="{ 'row-updating': updatingIds.has(item.id) }"
        >
          <td class="col-id mono">#{{ item.id }}</td>
          <td class="col-sku mono">{{ item.sku }}</td>
          <td class="col-status">
            <span :class="['badge', statusClass(item.status)]">
              {{ STATUS_LABELS[item.status] ?? item.status }}
            </span>
          </td>
          <td class="col-wh mono">
            <span class="wh-chip">WH-{{ item.warehouse_id }}</span>
          </td>
          <td class="col-actions">
            <div class="status-select-wrap">
              <div v-if="updatingIds.has(item.id)" class="spinner spinner-sm"></div>
              <div v-else class="select-wrap inline-select">
                <select
                  :value="item.status"
                  class="select select-inline"
                  :disabled="updatingIds.has(item.id)"
                  @change="onStatusChange(item, ($event.target as HTMLSelectElement).value)"
                >
                  <option
                    v-for="s in VALID_STATUSES"
                    :key="s"
                    :value="s"
                    :selected="s === item.status"
                  >
                    {{ STATUS_LABELS[s] }}
                  </option>
                </select>
                <span class="select-chevron">▾</span>
              </div>
            </div>
          </td>
        </tr>
      </TransitionGroup>
    </table>

    <!-- Pie de tabla: contador -->
    <div v-if="items.length" class="table-footer">
      <span class="muted">
        {{ items.length }} ítem{{ items.length !== 1 ? 's' : '' }} encontrado{{ items.length !== 1 ? 's' : '' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.table-wrap {
  position: relative;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface);
}

/* === OVERLAY DE CARGA === */
.table-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
}

/* === VACÍO === */
.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 60px;
  text-align: center;
}
.empty-icon {
  font-size: 32px;
  color: var(--text-subtle);
  margin-bottom: 8px;
  display: block;
}

/* === TABLA === */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead th {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
  padding: 12px 16px;
  text-align: left;
  background: var(--surface-raised);
  border-bottom: 1px solid var(--border);
}

.table tbody tr {
  border-bottom: 1px solid var(--border);
  transition: background var(--transition);
}
.table tbody tr:last-child { border-bottom: none; }
.table tbody tr:hover { background: var(--surface-raised); }
/* Fila actualizándose: indicador sutil */
.row-updating { opacity: 0.6; pointer-events: none; }

.table td {
  padding: 13px 16px;
  font-size: 13px;
  vertical-align: middle;
}

/* Columnas */
.col-id      { width: 60px; color: var(--text-muted); }
.col-sku     { width: 100px; }
.col-status  { width: 130px; }
.col-wh      { width: 100px; }
.col-actions { width: 160px; }

.wh-chip {
  font-size: 11px;
  padding: 3px 8px;
  background: var(--surface-raised);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
}

/* === SELECT INLINE === */
.status-select-wrap {
  display: flex;
  align-items: center;
}
.inline-select {
  position: relative;
  display: inline-block;
}
.select-inline {
  width: auto;
  padding: 5px 28px 5px 10px;
  font-size: 12px;
  background: var(--surface-raised);
  border-color: var(--border-light);
}
.select-inline:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-dim);
}

/* === SPINNERS === */
.spinner-lg { width: 28px; height: 28px; border-width: 3px; }
.spinner-sm { width: 14px; height: 14px; border-width: 2px; }

/* === PIE === */
.table-footer {
  padding: 10px 16px;
  border-top: 1px solid var(--border);
  background: var(--surface-raised);
  font-size: 12px;
}

/* === TRANSICIÓN DE FILAS === */
.row-enter-active { animation: fadeIn 200ms ease; }
.row-leave-active { transition: opacity 150ms; }
.row-leave-to     { opacity: 0; }
</style>