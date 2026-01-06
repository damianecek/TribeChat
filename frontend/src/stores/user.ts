import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserStatus } from 'src/types/user'
import { socketService } from 'src/services/SocketService'
import { api } from 'boot/axios'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const users = ref<User[]>([])

  /**
   * Set the current user
   */
  function setCurrentUser(user: User): void {
    currentUser.value = user
  }

  /**
   * Clear the current user
   */
  function clearCurrentUser(): void {
    currentUser.value = null
  }

  /**
   * Set all users
   */
  function setUsers(list: User[]): void {
    users.value = list
  }

  /**
   * Add a user
   */
  function addUser(user: User): void {
    if (!users.value.some((u) => u.id === user.id)) {
      users.value.push(user)
    }
  }

  /**
   * Update user status
   */
  function updateUserStatus(userId: number, newStatus: UserStatus): void {
    const u = users.value.find((u) => u.id === userId)
    if (u) u.status = newStatus
    if (currentUser.value?.id === userId) currentUser.value.status = newStatus
  }

  /**
   * Set current user status
   */
  function setCurrentUserStatus(newStatus: UserStatus): void {
    if (currentUser.value) currentUser.value.status = newStatus
  }

  /**
   * Fetch all users from API
   */
  async function fetchUsers(): Promise<void> {
    try {
      const res = await api.get<User[]>('/users')
      setUsers(res.data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  /**
   * Update user status via socket or HTTP API (fallback)
   */
  async function updateStatus(newStatus: UserStatus): Promise<void> {
    if (!currentUser.value) return
    
    // Update local state optimistically for immediate UI feedback
    setCurrentUserStatus(newStatus)
    
    const socket = socketService.getSocket()
    
    // If socket is connected, use it for real-time update
    if (socket?.connected) {
      socket.emit('user:setStatus', { status: newStatus })
    } else {
      // Fallback to HTTP API when socket is not connected (e.g., when status is Offline)
      try {
        await api.patch('/users/status', { status: newStatus })
      } catch (err) {
        console.error('Failed to update status via API:', err)
      }
    }
  }

  /**
   * Find user by nickname
   */
  const findUserByName = (nickname: string) =>
    users.value.find((u) => u.nickname === nickname) || null

  /**
   * Find user by ID
   */
  const findUserById = (id: number) => users.value.find((u) => u.id === id) || null

  /**
   * Get current user (computed)
   */
  const getCurrentUser = computed(() => currentUser.value)

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
  }
})

export type UserStore = ReturnType<typeof useUserStore>
