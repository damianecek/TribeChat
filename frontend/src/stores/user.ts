import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from 'src/types/user';

export const useUserStore = defineStore('user', () => {

  const currentUser = ref<User | null>(null);
  const users = ref<User[]>([]);

  function setCurrentUser(user: User) {
    currentUser.value = user;
  }

  function clearCurrentUser() {
    currentUser.value = null;
  }

  function setUsers(list: User[]) {
    users.value = list;
  }

  function addUser(user: User) {
    const exists = users.value.some((u) => u.id === user.id);
    if (!exists) users.value.push(user);
  }

  function updateUser(updated: User) {
    const idx = users.value.findIndex((u) => u.id === updated.id);
    if (idx !== -1) users.value[idx] = updated;
  }

  function removeUser(id: number) {
    users.value = users.value.filter((u) => u.id !== id);
  }

  function findUserByName(nickname: string): User | null {
    const user = users.value.find((u) => u.nickname === nickname);
    return user || null;
  }

  function findUserById(id: number): User | null {
    const user = users.value.find((u) => u.id === id);
    return user || null;
  }


  return {
    currentUser,
    users,
    setCurrentUser,
    clearCurrentUser,
    setUsers,
    addUser,
    updateUser,
    removeUser,
    findUserByName,
    findUserById
  };
});


export type UserStore = ReturnType<typeof useUserStore>;
