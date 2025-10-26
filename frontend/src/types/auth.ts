// src/types/auth.ts

import type { User } from "./user"

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
