import { ApiError } from './api'

export function formatError(error: unknown) {
  if (error instanceof ApiError) {
    const code = error.code ? ` (${error.code})` : ''
    return `${error.message}${code}`
  }
  if (error instanceof Error) return error.message
  return '알 수 없는 오류가 발생했습니다.'
}
