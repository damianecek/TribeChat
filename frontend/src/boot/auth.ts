import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
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
      return await router.push('/login')

    }
    else if (!to.meta.requiresAuth && isAuthenticated){
      return await router.push('/main')
    }
  })
})
