export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = unknown> {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: Record<string, string[]>
}
