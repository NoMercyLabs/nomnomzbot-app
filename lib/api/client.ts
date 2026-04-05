import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { Platform } from 'react-native'
import type { ApiError } from './types'

const baseURL =
  Platform.OS === 'web'
    ? '/api'
    : `${process.env.EXPO_PUBLIC_API_URL}/api`

export const apiClient = axios.create({
  baseURL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor -- log in dev
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (__DEV__) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Track in-flight refresh to prevent concurrent refreshes
let _isRefreshing = false
let _refreshQueue: Array<(token: string) => void> = []

function processRefreshQueue(token: string) {
  _refreshQueue.forEach((cb) => cb(token))
  _refreshQueue = []
}

// Response interceptor -- normalize errors + auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (_isRefreshing) {
        // Queue until the ongoing refresh completes
        return new Promise((resolve, reject) => {
          _refreshQueue.push((token) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`
            }
            resolve(apiClient(originalRequest))
          })
        })
      }

      _isRefreshing = true

      try {
        // Lazy-import to avoid circular dependency at module init time
        const { useAuthStore } = await import('@/stores/useAuthStore')
        await useAuthStore.getState().refreshToken()
        const newToken = useAuthStore.getState().accessToken

        if (!newToken) {
          throw new Error('No token after refresh')
        }

        processRefreshQueue(newToken)

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        }

        return apiClient(originalRequest)
      } catch {
        _refreshQueue = []

        const { useAuthStore } = await import('@/stores/useAuthStore')
        useAuthStore.getState().logout()

        // Let upstream handle navigation (the app's root layout watches isAuthenticated)
        const apiError: ApiError = {
          message: 'Session expired. Please sign in again.',
          status: 401,
        }
        return Promise.reject(apiError)
      } finally {
        _isRefreshing = false
      }
    }

    const message =
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred'

    const apiError: ApiError = {
      message,
      code: error.response?.data?.code,
      status: error.response?.status,
      details: error.response?.data?.details,
    }

    return Promise.reject(apiError)
  },
)
