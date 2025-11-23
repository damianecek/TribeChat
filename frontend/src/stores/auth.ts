import { defineStore } from 'pinia'
import { authService, authManager } from 'src/services'
import { api } from 'src/boot/axios'

import { useChannelsStore } from './channels'
import { useUserChannelsStore } from './user_channels'
import { useUserStore } from './user'

import type { User, Channel, UserChannel } from 'src/types'
import type { AuthResponse, LoginCredentials, RegisterData } from 'src/types/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: authManager.getToken(),
    initialized: false, // prevents double-loading
  }),

  getters: {
    isLoggedIn: (state) => state.user !== null,
  },

  actions: {
    // -------------------------
    // INITIALIZE STORE
    // -------------------------
    async init() {
      if (this.initialized) return
      this.initialized = true

      // 1) Sync axios header
      if (this.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      }

      // 2) Fetch user if token exists
      if (this.token) {
        await this.fetchUser()
      }

      // 3) react to token changes (TAB SYNC)
      authManager.onChange((newToken) => async () => {
        if (newToken) {
          await this.handleLoginToken(newToken)
        } else {
          this.handleLogout()
        }
      })
    },

    async isAuthenticated(): Promise<boolean> {
      if (this.user) {
        console.log('User already authenticated')
        return true
      }

      const token = authManager.getToken()

      if (!token) {
        return false
      }

      await this.handleLoginToken(token)
      return this.user !== null
    },

    // -------------------------
    // LOGIN
    // -------------------------
    async login(credentials: LoginCredentials) {
      const data: AuthResponse = await authService.login(credentials)

      authManager.setToken(data.token.token)
      // token change listener will handle the rest
    },

    async register(registerData: RegisterData) {
      const data: AuthResponse = await authService.register(registerData)

      authManager.setToken(data.token.token)
      // token change listener will handle the rest
    },

    // Called when token changes
    async handleLoginToken(token: string) {
      this.token = token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      await this.fetchUser()
    },

    // -------------------------
    // LOAD USER + INITIAL DATA
    // -------------------------
    async fetchUser() {
      try {
        const res = await authService.me()

        const user = res?.user || null

        if (!user) {
          // token invalid or expired
          return this.logout()
        }

        this.user = user

        // sync user store
        const userStore = useUserStore()
        userStore.setCurrentUser(user)

        await this.fetchInitialData()
      } catch (err) {
        console.error('Fetch user failed:', err)
      }
    },

    async fetchInitialData() {
      const channelsStore = useChannelsStore();
      const userChannelsStore = useUserChannelsStore();
      const userStore = useUserStore();

      try {
        const [channelsRes, userChannelsRes, usersRes] = await Promise.all([
          api.get<Channel[]>('/channels'),
          api.get<UserChannel[]>('/user-channels'),
          api.get<User[]>('/users'),
        ]);

        channelsStore.setChannels(channelsRes.data);
        userChannelsStore.setUserChannels(userChannelsRes.data);
        userStore.setUsers(usersRes.data);
      } catch (err) {
        console.error('Init fetch error:', err);
      }
    },

    // -------------------------
    // LOGOUT
    // -------------------------
    async logout() {
      try {
        await authService.logout()
      } catch (err) {
        console.error('Logout request failed:', err)
      } finally {
        authManager.removeToken()
        this.handleLogout()
      }
    },

    // Called when token removed
    handleLogout() {
      this.token = null
      this.user = null
      console.log('User logged out, cleared auth store ' + this.user)

      delete api.defaults.headers.common['Authorization']

      const channelsStore = useChannelsStore()
      const userChannelsStore = useUserChannelsStore()
      const userStore = useUserStore()

      channelsStore.setChannels([])
      userChannelsStore.setUserChannels([])
      userStore.clearCurrentUser()
    },
  },
})

export type AuthStore = ReturnType<typeof useAuthStore>
