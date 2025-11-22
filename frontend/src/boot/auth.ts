import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'stores/auth'
import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean,
    guestOnly?: boolean
  }
}

const loginRoute = (from: RouteLocationNormalized): RouteLocationRaw => {
  return {
    name: 'login',
    query: { redirect: from.fullPath }
  }
}

export default boot(async ({router}) => {
  const authStore = useAuthStore()
  await authStore.init()
  // add route guard to check auth user
  router.beforeEach(async (to) => {
    const isAuthenticated = await authStore.isAuthenticated()

    // route requires authentication
    if (to.meta.requiresAuth && !isAuthenticated) {
      // check if logged in if not, redirect to login page
      return loginRoute(to)
    }
  })
})
