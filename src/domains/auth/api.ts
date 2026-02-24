import { requestJson } from '../../shared/api/client'
import type { LoginResponse, RegisterResponse } from './types'

export function registerApiKey(apiKey: string) {
  return requestJson<RegisterResponse>('/api/auth/apiKey', {
    method: 'POST',
    headers: { 'X-API-KEY': apiKey },
  })
}

export function login(apiKey: string) {
  return requestJson<LoginResponse>('/api/auth/login', {
    method: 'GET',
    headers: { 'X-API-KEY': apiKey },
  })
}
