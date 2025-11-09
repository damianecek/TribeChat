// src/stores/auth.ts
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { MeResponse } from 'src/types/auth';
import type { User } from 'src/types/user';
import { useChannelsStore } from './channels';
import { useUserChannelsStore } from './user_channels';
import type { Channel } from 'src/types';
import type { UserChannel } from 'src/types/user_channel';
import { useUserStore } from './user';

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
      this.token = token;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    /**
     * Fetchne informácie o userovi (/me endpoint)
     * + následne stiahne všetky dáta potrebné po logine
     */
    async fetchUser() {
      if (!this.token) return;
      try {
        const res = await api.get<MeResponse>('/me');
        this.user = res.data.user;

        // keď user existuje, načítaj všetky init dáta
        await this.fetchInitialData();
      } catch (err) {
        console.error('Fetch user error:', err);
        this.user = null;
        throw err;
      }
    },

    /**
     * Inicializačné fetchovanie (channels, user-channels)
     */
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
    /**
     * Odhlásenie a vyčistenie všetkých dát
     */
    async logout() {
      try {
        await api.post('/logout');
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        this.user = null;
        this.token = '';
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];

        // vyčisti store-y
        const channelsStore = useChannelsStore();
        const userChannelsStore = useUserChannelsStore();
        channelsStore.setChannels([]);
        userChannelsStore.setUserChannels([]);
      }
    },
  },
});

export type AuthStore = ReturnType<typeof useAuthStore>;
