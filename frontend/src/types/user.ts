export type UserStatus = 'Online' | 'Away' | 'Offline' | 'DND'

export interface User {
  id: number
  firstName: string
  lastName: string
  nickname: string
  email: string
  status: UserStatus
  icon?: string
}
