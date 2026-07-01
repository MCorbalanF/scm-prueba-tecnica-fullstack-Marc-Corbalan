<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/auth'
import { ApiError } from '../api/client'
import { useToast } from '../composables/useToast'

const router = useRouter()
const { error: showError } = useToast()

const username = ref('')
const password = ref('')
const loading  = ref(false)
const fieldError = ref('')

async function handleLogin() {
  fieldError.value = ''
  if (!username.value.trim() || !password.value) {
    fieldError.value = 'Introduce usuario y contraseña.'
    return
  }

  loading.value = true
  try {
    await login(username.value.trim(), password.value)
    await router.push('/items')
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      fieldError.value = 'Credenciales incorrectas. Prueba con demo/demo.'
    } else {
      showError('Error de conexión con el servidor.')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- Panel izquierdo: branding -->
    <aside class="login-brand">
      <!-- Patrón de grid de fondo decorativo -->
      <div class="brand-grid" aria-hidden="true"></div>

      <div class="brand-content">
        <div class="brand-logo">
          <span class="brand-icon">⬡</span>
          <span class="brand-name mono">SCM</span>
        </div>
        <h1 class="brand-headline">
          Supply Chain<br />Management
        </h1>
        <p class="brand-sub">
          Control de inventario en tiempo real.<br />
          Busca, filtra y gestiona el estado de cada ítem en tu almacén.
        </p>

        <!-- Estadísticas decorativas -->
        <div class="brand-stats">
          <div class="stat">
            <span class="stat-value mono">5</span>
            <span class="stat-label">Ítems en sistema</span>
          </div>
          <div class="stat">
            <span class="stat-value mono">3-20</span>
            <span class="stat-label">Almacenes activos</span>
          </div>
          <div class="stat">
            <span class="stat-value mono">JWT</span>
            <span class="stat-label">Autenticación segura</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Panel derecho: formulario -->
    <main class="login-form-panel">
      <form class="login-form card" @submit.prevent="handleLogin">
        <div class="form-header">
          <h2>Iniciar sesión</h2>
          <p class="muted">Accede con tus credenciales de operador.</p>
        </div>

        <div class="form-field">
          <label for="username">Usuario</label>
          <input
            id="username"
            v-model="username"
            class="input"
            type="text"
            placeholder="demo"
            autocomplete="username"
            :disabled="loading"
          />
        </div>

        <div class="form-field">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            class="input"
            type="password"
            placeholder="••••••"
            autocomplete="current-password"
            :disabled="loading"
            @keydown.enter="handleLogin"
          />
        </div>

        <Transition name="fade">
          <p v-if="fieldError" class="form-error">{{ fieldError }}</p>
        </Transition>

        <button type="submit" class="btn btn-primary btn-login" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span>{{ loading ? 'Verificando…' : 'Entrar' }}</span>
        </button>

        <p class="form-hint muted">
          Credenciales de prueba: <code class="mono">admin / admin</code>
        </p>
      </form>
    </main>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
}

/* ===== PANEL IZQUIERDO ===== */
.login-brand {
  flex: 1;
  background: var(--surface);
  border-right: 1px solid var(--border);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

/* Grid decorativo de puntos */
.brand-grid {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, var(--border-light) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.5;
}
/* Gradiente que difumina el grid en los bordes */
.login-brand::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 50%, rgba(245,158,11,0.05) 0%, transparent 60%),
    linear-gradient(to right, var(--surface), transparent 70%),
    linear-gradient(to bottom, var(--surface), transparent 20%, transparent 80%, var(--surface));
  pointer-events: none;
}

.brand-content {
  position: relative;
  z-index: 1;
  max-width: 420px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 40px;
}
.brand-icon {
  font-size: 28px;
  color: var(--accent);
  line-height: 1;
}
.brand-name {
  font-size: 22px;
  font-weight: 500;
  color: var(--text);
  letter-spacing: 0.1em;
}

.brand-headline {
  font-size: 40px;
  font-weight: 600;
  line-height: 1.15;
  margin-bottom: 16px;
  color: var(--text);
}
/* Acento ámbar en la última línea (decorativo, no semántico) */
.brand-headline::first-line {
  color: var(--text);
}

.brand-sub {
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 40px;
}

.brand-stats {
  display: flex;
  gap: 32px;
  padding-top: 32px;
  border-top: 1px solid var(--border);
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-value {
  font-size: 24px;
  font-weight: 500;
  color: var(--accent);
}
.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ===== PANEL DERECHO ===== */
.login-form-panel {
  width: 420px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: var(--bg);
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-field label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-login {
  width: 100%;
  justify-content: center;
  padding: 11px;
  font-size: 14px;
}

.form-error {
  color: var(--danger);
  font-size: 12px;
  padding: 8px 12px;
  background: var(--danger-dim);
  border-radius: var(--radius);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.form-hint {
  font-size: 12px;
  text-align: center;
}
.form-hint code {
  font-size: 12px;
  background: var(--surface-raised);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .login-page { flex-direction: column; }
  .login-brand { display: none; }
  .login-form-panel { width: 100%; padding: 24px; align-items: flex-start; padding-top: 60px; }
}
</style>