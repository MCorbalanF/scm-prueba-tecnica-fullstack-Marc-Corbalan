<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FilterBuilder from '../components/FilterBuilder.vue'
import ItemsTable from '../components/ItemsTable.vue'
import { searchItems, type FilterCondition, type ItemOut } from '../api/items'
import { logout, getCurrentUser } from '../api/auth'
import { ApiError } from '../api/client'
import { useToast } from '../composables/useToast'

const router  = useRouter()
const { error: showError } = useToast()

const currentUser = ref(getCurrentUser() ?? 'usuario')
const items       = ref<ItemOut[]>([])
const loading     = ref(false)
const hasSearched = ref(false)
const activeFilters = ref<FilterCondition[]>([])

// Búsqueda inicial al cargar la vista (sin filtros = todos los ítems)
onMounted(() => runSearch())

function onFiltersChange(filters: FilterCondition[]) {
  activeFilters.value = filters
}

async function runSearch() {
  loading.value = true
  hasSearched.value = true
  try {
    items.value = await searchItems(activeFilters.value)
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      // El cliente ya intentó el refresh; si llega aquí, la sesión caducó
      showError('Sesión caducada. Vuelve a iniciar sesión.')
      doLogout()
    } else if (err instanceof ApiError) {
      showError(`Error en la búsqueda: ${err.message}`)
    } else {
      showError('Error de conexión con el servidor.')
    }
  } finally {
    loading.value = false
  }
}

function doLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <div class="items-page">
    <!-- ===== TOP BAR ===== -->
    <header class="topbar">
      <div class="topbar-brand">
        <span class="brand-icon">⬡</span>
        <span class="brand-name mono">SCM</span>
        <span class="brand-divider">/</span>
        <span class="brand-section">Inventario</span>
      </div>

      <div class="topbar-right">
        <div class="user-chip">
          <span class="user-avatar">{{ currentUser[0].toUpperCase() }}</span>
          <span class="user-name mono">{{ currentUser }}</span>
        </div>
        <button class="btn btn-ghost btn-sm" @click="doLogout">
          Cerrar sesión
        </button>
      </div>
    </header>

    <!-- ===== CONTENIDO PRINCIPAL ===== -->
    <main class="main-content">
      <!-- Cabecera de página -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Ítems de inventario</h1>
          <p class="page-sub muted">
            Filtra por campo y operador, y actualiza el estado de cada ítem.
          </p>
        </div>
      </div>

      <!-- Panel de filtros + botón de búsqueda -->
      <div class="search-panel card">
        <FilterBuilder @change="onFiltersChange" />

        <div class="search-actions">
          <button
            class="btn btn-primary search-btn"
            :disabled="loading"
            @click="runSearch"
          >
            <span v-if="loading" class="spinner"></span>
            <span>{{ loading ? 'Buscando…' : 'Buscar' }}</span>
          </button>
        </div>
      </div>

      <!-- Resultados -->
      <Transition name="fade">
        <div v-if="hasSearched" class="results-section">
          <div class="results-header">
            <span class="results-label">
              Resultados
              <span v-if="!loading" class="results-count mono">
                ({{ items.length }})
              </span>
            </span>
          </div>
          <ItemsTable
            :items="items"
            :loading="loading"
          />
        </div>
      </Transition>
    </main>
  </div>
</template>

<style scoped>
.items-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
}

/* ===== TOP BAR ===== */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.brand-icon  { color: var(--accent); font-size: 20px; }
.brand-name  { font-size: 16px; font-weight: 500; letter-spacing: 0.08em; }
.brand-divider { color: var(--text-subtle); }
.brand-section { font-size: 14px; color: var(--text-muted); }

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px 5px 6px;
  background: var(--surface-raised);
  border: 1px solid var(--border-light);
  border-radius: 99px;
}
.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent-dim);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(245,158,11,0.3);
}
.user-name { font-size: 13px; }

/* ===== MAIN ===== */
.main-content {
  flex: 1;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.page-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
}
.page-sub { font-size: 14px; }

/* ===== PANEL DE BÚSQUEDA ===== */
.search-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
  border-top: 1px solid var(--border);
}
.search-btn {
  padding: 9px 24px;
  min-width: 120px;
  justify-content: center;
}

/* ===== RESULTADOS ===== */
.results-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.results-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}
.results-count {
  color: var(--accent);
  font-size: 12px;
}
</style>