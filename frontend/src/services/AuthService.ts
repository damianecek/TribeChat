import type { AuthResponse, LoginCredentials, RegisterData, MeResponse } from 'src/types/auth'
import { api } from 'src/boot/axios'

class AuthService {
  async me (): Promise<MeResponse | null> {
    return api.get<MeResponse>('/me')
      .then((response) => response.data)
      .catch((error) => {
        if (error.response?.status === 401) {
          return null
        }

        return error
      })
  }

  async register (data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/register', data)
    return response.data
  }

  async login (credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/login', credentials)
    return response.data
  }

  async logout (): Promise<void> {
    await api.post('/logout')
  }
}

export default new AuthService()
