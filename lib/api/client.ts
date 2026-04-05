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

// Response interceptor -- normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
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
