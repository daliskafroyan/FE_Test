import { LoginResponse } from "@/api/auth"
import { useAuthStore } from "@/stores/authStore"
import { jwtDecode } from "jwt-decode"

// Define the expected token payload structure
interface JwtTokenPayload {
    id?: number;
    username?: string;
    exp?: number;
    iat?: number;
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

// Save the authentication information and integrate with authStore
export const saveAuth = (data: LoginResponse) => {
    if (data.token) {
        // Set token in authStore
        useAuthStore.getState().auth.setAccessToken(data.token)

        // Try to decode and set user data
        try {
            const decoded = jwtDecode<JwtTokenPayload>(data.token)
            useAuthStore.getState().auth.setUser({
                accountNo: String(decoded.id || ''),
                email: decoded.username || '',
                role: ['user'], // Default role - adjust as needed
                exp: decoded.exp || 0
            })
        } catch (error) {
            console.error('Failed to decode token', error)
        }
    }
}

// Get the authentication token
export const getToken = (): string => {
    return useAuthStore.getState().auth.accessToken
}

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
    const token = getToken()

    if (!token) {
        return false
    }

    // Check if token is expired
    try {
        const decoded = jwtDecode<JwtTokenPayload>(token)
        if (!decoded.exp) {
            return true // If no expiration, assume valid
        }

        // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
        return decoded.exp * 1000 > Date.now()
    } catch (error) {
        console.error('Error validating token', error)
        // If we can't decode the token, assume it's invalid
        return false
    }
}

// Clear authentication data (logout)
export const clearAuth = () => {
    useAuthStore.getState().auth.reset()
}

// Helper to extract username from JWT token payload
// Note: This is a simple implementation that doesn't validate the token
const extractUsernameFromToken = (token: string): string | null => {
    try {
        const payload = token.split('.')[1]
        const decodedPayload = JSON.parse(atob(payload))
        return decodedPayload.username || null
    } catch (error) {
        console.error('Error extracting username from token', error)
        return null
    }
} 