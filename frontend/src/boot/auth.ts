import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'stores/auth'

export default boot(async () => {
  const auth = useAuthStore()
  if (auth.token && !auth.user) {
    try {
      await auth.fetchUser()
    } catch (err) {
      console.error('Auto-fetch user failed:', err)
    }
  }
})
