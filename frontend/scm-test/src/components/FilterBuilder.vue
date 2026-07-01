<script setup lang="ts">
/**
 * FilterBuilder — permite al usuario añadir/eliminar filtros dinámicos.
 *
 * Diseño: fila con selects (campo, operador) + input de valor + botón añadir.
 * Los filtros aplicados aparecen como chips eliminables encima de la tabla.
 *
 * El operador "is null" no muestra input de valor (el backend espera value=null).
 * El operador "in" convierte la entrada "a,b,c" en array ["a","b","c"].
 */

import { ref, computed } from 'vue'
import {
  type FilterCondition,
  type FilterField,
  type FilterOperator,
  FIELD_LABELS,
  OPERATOR_LABELS,
  VALUELESS_OPERATORS,
  LIST_OPERATORS,
} from '../api/items'

const emit = defineEmits<{
  change: [filters: FilterCondition[]]
}>()

// --- Filtros aplicados (chips) -------------------------------------------
const appliedFilters = ref<FilterCondition[]>([])

// --- Estado del formulario de nuevo filtro --------------------------------
const newField    = ref<FilterField>('status')
const newOperator = ref<FilterOperator>('=')
const newValue    = ref('')

const isValueless = computed(() => VALUELESS_OPERATORS.includes(newOperator.value))
const isList      = computed(() => LIST_OPERATORS.includes(newOperator.value))

// Cuando cambia el operador, limpiamos el valor para evitar confusiones
function onOperatorChange() {
  newValue.value = ''
}

const FIELDS = Object.entries(FIELD_LABELS) as [FilterField, string][]
const OPERATORS = Object.entries(OPERATOR_LABELS) as [FilterOperator, string][]

const addError = ref('')

function addFilter() {
  addError.value = ''

  if (!isValueless.value && newValue.value.trim() === '') {
    addError.value = 'Introduce un valor para el filtro.'
    return
  }

  let value: FilterCondition['value'] = null
  if (!isValueless.value) {
    if (isList.value) {
      // Convierte "pending,done" → ["pending","done"]
      value = newValue.value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      if ((value as string[]).length === 0) {
        addError.value = 'Escribe al menos un valor separado por comas.'
        return
      }
    } else {
      // Intenta parsear como número para campos numéricos
      const num = Number(newValue.value)
      value = isNaN(num) ? newValue.value : num
    }
  }

  appliedFilters.value.push({
    field:    newField.value,
    operator: newOperator.value,
    value,
  })

  newValue.value = ''
  emit('change', appliedFilters.value)
}

function removeFilter(index: number) {
  appliedFilters.value.splice(index, 1)
  emit('change', appliedFilters.value)
}

function clearAll() {
  appliedFilters.value = []
  emit('change', [])
}

// Label legible para un chip de filtro
function chipLabel(f: FilterCondition): string {
  const fieldLabel = FIELD_LABELS[f.field]
  const opLabel    = OPERATOR_LABELS[f.operator]
  const valueLabel = Array.isArray(f.value)
    ? f.value.join(', ')
    : f.value == null
      ? ''
      : String(f.value)

  return `${fieldLabel} ${opLabel}${valueLabel ? ' ' + valueLabel : ''}`
}
</script>

<template>
  <div class="filter-builder">
    <div class="builder-header">
      <span class="builder-title">Filtros</span>
      <button
        v-if="appliedFilters.length"
        class="btn btn-ghost btn-sm"
        type="button"
        @click="clearAll"
      >
        Limpiar todo
      </button>
    </div>

    <!-- Fila de construcción de filtro -->
    <div class="builder-row">
      <!-- Campo -->
      <div class="field-wrap">
        <label class="select-label">Campo</label>
        <div class="select-wrap">
          <select v-model="newField" class="select">
            <option v-for="[val, label] in FIELDS" :key="val" :value="val">
              {{ label }}
            </option>
          </select>
          <span class="select-chevron">▾</span>
        </div>
      </div>

      <!-- Operador -->
      <div class="field-wrap">
        <label class="select-label">Operador</label>
        <div class="select-wrap">
          <select v-model="newOperator" class="select" @change="onOperatorChange">
            <option v-for="[val, label] in OPERATORS" :key="val" :value="val">
              {{ label }}
            </option>
          </select>
          <span class="select-chevron">▾</span>
        </div>
      </div>

      <!-- Valor -->
      <div class="field-wrap field-value" :class="{ hidden: isValueless }">
        <label class="select-label">
          {{ isList ? 'Valores (separados por comas)' : 'Valor' }}
        </label>
        <input
          v-model="newValue"
          :placeholder="isList ? 'pending, done' : 'ej. pending'"
          class="input"
          type="text"
          :disabled="isValueless"
          @keydown.enter.prevent="addFilter"
        />
      </div>

      <button class="btn btn-primary add-btn" type="button" @click="addFilter">
        + Añadir
      </button>
    </div>

    <Transition name="fade">
      <p v-if="addError" class="builder-error">{{ addError }}</p>
    </Transition>

    <!-- Chips de filtros activos -->
    <TransitionGroup name="chip" tag="div" class="chips" v-if="appliedFilters.length">
      <div
        v-for="(f, i) in appliedFilters"
        :key="i"
        class="chip"
      >
        <span class="chip-field mono">{{ FIELD_LABELS[f.field] }}</span>
        <span class="chip-op">{{ OPERATOR_LABELS[f.operator] }}</span>
        <span v-if="f.value != null" class="chip-value mono">
          {{ Array.isArray(f.value) ? f.value.join(', ') : f.value }}
        </span>
        <button class="chip-remove" type="button" @click="removeFilter(i)" aria-label="Eliminar filtro">
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.filter-builder {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.builder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.builder-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.builder-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.field-wrap {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 130px;
}
.field-value { flex: 1; min-width: 180px; }
.field-wrap.hidden { visibility: hidden; }

.select-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.select-wrap {
  position: relative;
}
.select-wrap .select {
  padding-right: 28px;
}
.select-chevron {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 11px;
  pointer-events: none;
}

.add-btn {
  align-self: flex-end;
  flex-shrink: 0;
}

.builder-error {
  font-size: 12px;
  color: var(--danger);
}

/* === Chips === */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px 4px 10px;
  background: var(--accent-dim);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 99px;
  font-size: 12px;
  white-space: nowrap;
}
.chip-field  { color: var(--accent); font-size: 11px; }
.chip-op     { color: var(--text-muted); font-size: 11px; }
.chip-value  { color: var(--text); font-size: 11px; }
.chip-remove {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0 2px;
  transition: color var(--transition);
  margin-left: 2px;
}
.chip-remove:hover { color: var(--danger); }

/* Transición chips */
.chip-enter-active { animation: fadeIn 150ms ease; }
.chip-leave-active { transition: opacity 100ms ease, transform 100ms ease; }
.chip-leave-to     { opacity: 0; transform: scale(0.9); }
</style>