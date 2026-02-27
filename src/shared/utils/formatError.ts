import { ApiError } from '../api/client'

export function formatError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'JWT0002') return ''
    const code = error.code ? ` (${error.code})` : ''
    return `${error.message}${code}`
  }
  if (error instanceof Error) return error.message
  return '알 수 없는 오류가 발생했습니다.'
}
