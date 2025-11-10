import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, UserStatus } from 'src/types/user';
import { api } from 'boot/axios';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null);
  const users = ref<User[]>([]);

  // nastavenie usera
  function setCurrentUser(user: User) {
    currentUser.value = user;
  }

  function clearCurrentUser() {
    currentUser.value = null;
  }

  // správa userov v pamäti
  function setUsers(list: User[]) {
    users.value = list;
  }

  function addUser(user: User) {
    if (!users.value.some((u) => u.id === user.id)) {
      users.value.push(user);
    }
  }

  // aktualizácia statusu
  function updateUserStatus(userId: number, newStatus: UserStatus) {
    const u = users.value.find((u) => u.id === userId);
    if (u) u.status = newStatus;
    if (currentUser.value?.id === userId) currentUser.value.status = newStatus;
  }

  function setCurrentUserStatus(newStatus: UserStatus) {
    if (currentUser.value) currentUser.value.status = newStatus;
  }

  // API volania
  async function fetchUsers() {
    try {
      const res = await api.get<User[]>('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }

  async function updateStatus(newStatus: UserStatus) {
    try {
      await api.patch('/users/status', { status: newStatus });
      setCurrentUserStatus(newStatus);
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  }

  // helpers
  function findUserByName(nickname: string) {
    return users.value.find((u) => u.nickname === nickname) || null;
  }

  function findUserById(id: number) {
    return users.value.find((u) => u.id === id) || null;
  }

  const getCurrentUser = computed(() => currentUser.value);

  return {
    currentUser,
    users,
    setCurrentUser,
    clearCurrentUser,
    setUsers,
    addUser,
    updateUserStatus,
    fetchUsers,
    updateStatus,
    setCurrentUserStatus,
    findUserByName,
    findUserById,
    getCurrentUser,
  };
});

export type UserStore = ReturnType<typeof useUserStore>;
