import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import ItemsView from '../views/ItemsView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: () => {
        // Redirige al login si no hay token, a /items si ya está autenticado
        return localStorage.getItem('access_token') ? '/items' : '/login'
      },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      // Si ya tiene token, va directo a /items
      beforeEnter: () => {
        if (localStorage.getItem('access_token')) return '/items'
      },
    },
    {
      path: '/items',
      name: 'items',
      component: ItemsView,
      meta: { requiresAuth: true },
    },
    // Catch-all: redirige al inicio
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// Guard global: protege rutas con meta.requiresAuth
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('access_token')) {
    return '/login'
  }
})