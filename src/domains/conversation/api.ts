import { requestJson } from '../../shared/api/client'
import type {
  ConversationListResponse,
  CreateConversationResponse,
  MessageListResponse,
} from './types'

export function createConversation(title: string) {
  return requestJson<CreateConversationResponse>('/api/conversations', {
    method: 'POST',
    body: { title },
  })
}

export function getConversations(cursor?: number | null) {
  const params = new URLSearchParams()
  if (cursor !== undefined && cursor !== null) {
    params.set('cursor', String(cursor))
  }
  const query = params.toString()
  return requestJson<ConversationListResponse>(
    query ? `/api/conversations?${query}` : '/api/conversations',
  )
}

export function getConversationMessages(conversationId: number, cursor?: number | null) {
  const params = new URLSearchParams()
  if (cursor !== undefined && cursor !== null) {
    params.set('cursor', String(cursor))
  }
  const query = params.toString()
  return requestJson<MessageListResponse>(
    query
      ? `/api/conversations/${conversationId}/messages?${query}`
      : `/api/conversations/${conversationId}/messages`,
  )
}

export function deleteConversation(conversationId: number) {
  return requestJson<void>(`/api/conversations/${conversationId}`, {
    method: 'DELETE',
  })
}
