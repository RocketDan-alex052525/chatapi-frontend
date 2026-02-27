import { ApiError } from '../api/client'

export function formatError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'JWT0002') return ''
    if (
      error.message.includes('이미 등록된 유저') ||
      error.message.toLowerCase().includes('유효하지 않은 api key')
    ) {
      return error.message
    }
    const code = error.code ? ` (${error.code})` : ''
    return `${error.message}${code}`
  }
  if (error instanceof Error) return error.message
  return '알 수 없는 오류가 발생했습니다.'
}
