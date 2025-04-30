import { useMutation } from '@tanstack/react-query'

export interface LoginRequest {
    username: string
    password: string
}

export interface LoginResponse {
    status: boolean
    message: string
    code: number
    is_logged_in: number
    token: string
}

const API_BASE_URL = 'http://localhost:8080/api'

export const authApi = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        })

        if (!response.ok) {
            throw new Error('Login failed')
        }

        return response.json()
    },
}

export function useLogin() {
    return useMutation({
        mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    })
} 