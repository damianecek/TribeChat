// src/stores/auth.ts
import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import type { MeResponse } from 'src/types/auth'
import type { User } from 'src/types/user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || '',
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
  },

  actions: {
    /**
     * Nastaví token do state, localStorage a axios headera
     */
    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },

    /**
     * Získa informácie o prihlásenom userovi (/me endpoint)
     */
    async fetchUser() {
      if (!this.token) return
      try {
        const res = await api.get<MeResponse>('/me')
        this.user = res.data.user
      } catch (err) {
        console.error('Fetch user error:', err)
        this.user = null
        throw err
      }
    },

    /**
     * Odhlási usera a vyčistí všetko
     */
    async logout() {
      try {
        await api.post('/logout')
      } catch (err) {
        console.error('Logout error:', err)
      } finally {
        this.user = null
        this.token = ''
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
      }
    },
  },
})

export type AuthStore = ReturnType<typeof useAuthStore>
