export type ConversationSummary = {
  conversationId: number
  title: string
}

export type ConversationListResponse = {
  conversations: ConversationSummary[]
  nextCursor: number | null
  hasNext: boolean
}

export type MessageInfoResponse = {
  role: string
  content: string
}

export type MessageListResponse = {
  messages: MessageInfoResponse[]
  nextCursor: number | null
  hasNext: boolean
}

export type Message = {
  id?: number
  role: 'user' | 'assistant'
  content: string
}

export type CreateConversationResponse = {
  conversationId: number
}
