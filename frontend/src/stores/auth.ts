// src/stores/auth.ts
import { defineStore } from 'pinia'
import { api } from 'boot/axios' // Quasar usually sets axios here

import type {User, MeResponse} from 'src/types/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || ''
  }),

  getters: {
    isLoggedIn: (state) => !!state.user
  },

  actions: {
    async fetchUser() {
      try {
        const res = await api.get<MeResponse>('/me')
        this.user = res.data.user
      } catch (err) {
        this.user = null
        throw err
      }
    },

    async logout() {
      try {
        await api.post('/logout')
      } catch (err) {
        console.error(err)
      } finally {
        this.user = null
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
      }
    }
  }
})
