// src/types/auth.ts

export interface User {
  id: number
  firstName: string
  lastName: string
  nickname: string
  email: string
}

export interface AuthToken {
  type: string
  token: string
  expiresAt: string
}

export interface AuthResponse {
  user: User
  token: AuthToken
}

export interface MeResponse {
  user: User
}
