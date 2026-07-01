<script setup lang="ts">
import { useToast } from './composables/useToast'
import { RouterView } from 'vue-router'

const { toasts } = useToast()

const ICON: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}
</script>

<template>
  <RouterView />

  <!-- Toasts globales -->
  <Transition name="fade">
    <div v-if="toasts.length" class="toast-wrap">
      <TransitionGroup name="fade">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`]"
        >
          <span class="toast-icon">{{ ICON[toast.type] }}</span>
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Transition>
</template>

<style scoped>
.toast-icon {
  font-size: 12px;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: currentColor;
  color: var(--bg);
  flex-shrink: 0;
  font-size: 10px;
}
</style>