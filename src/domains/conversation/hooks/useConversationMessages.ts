import { useEffect, useState } from 'react'
import { formatError } from '../../../shared/utils/formatError'
import { getConversationMessages } from '../api'
import type { Message } from '../types'

function normalizeRole(role: string): 'user' | 'assistant' {
  const normalized = role.trim().toLowerCase()
  if (normalized === 'assistant' || normalized === 'ai' || normalized === 'bot') return 'assistant'
  if (normalized === 'user' || normalized === 'human') return 'user'
  return 'assistant'
}

type UseConversationMessagesResult = {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  hasNext: boolean
  isLoading: boolean
  status: string
  error: string
  loadMore: () => Promise<void>
}

export function useConversationMessages(
  activeConversationId: number | null,
): UseConversationMessagesResult {
  const [messages, setMessages] = useState<Message[]>([])
  const [hasNext, setHasNext] = useState(false)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([])
      setNextCursor(null)
      setHasNext(false)
      setError('')
      setStatus('')
      return
    }

    async function loadMessages() {
      setError('')
      setStatus('')
      setIsLoading(true)
      try {
        const result = await getConversationMessages(activeConversationId!)
        const ordered = [...result.messages].reverse()
        setMessages(
          ordered.map((msg, index) => ({
            id: index,
            role: normalizeRole(msg.role),
            content: msg.content,
          })),
        )
        setNextCursor(result.nextCursor)
        setHasNext(result.hasNext)
        setStatus(`메시지 ${result.messages.length}건 불러옴`)
      } catch (err) {
        setError(formatError(err))
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [activeConversationId])

  async function loadMore() {
    if (!activeConversationId || !hasNext || isLoading) return
    setError('')
    setStatus('')
    setIsLoading(true)
    try {
      const result = await getConversationMessages(activeConversationId, nextCursor)
      const ordered = [...result.messages].reverse()
      setMessages((prev) => [
        ...ordered.map((msg, index) => ({
          id: prev.length + index,
          role: normalizeRole(msg.role),
          content: msg.content,
        })),
        ...prev,
      ])
      setNextCursor(result.nextCursor)
      setHasNext(result.hasNext)
      setStatus(`메시지 ${result.messages.length}건 추가`)
    } catch (err) {
      setError(formatError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return { messages, setMessages, hasNext, isLoading, status, error, loadMore }
}
