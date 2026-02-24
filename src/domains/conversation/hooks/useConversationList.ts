import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatError } from '../../../shared/utils/formatError'
import { createConversation, deleteConversation, getConversations } from '../api'
import type { ConversationSummary } from '../types'

type UseConversationListResult = {
  conversations: ConversationSummary[]
  hasNext: boolean
  isLoading: boolean
  status: string
  error: string
  deleteError: string
  deleteLoadingId: number | null
  loadMore: () => Promise<void>
  handleDelete: (conversationId: number, activeConversationId: number | null) => Promise<void>
  handleCreate: (title: string) => Promise<boolean>
  createLoading: boolean
  createError: string
}

export function useConversationList(): UseConversationListResult {
  const navigate = useNavigate()

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [hasNext, setHasNext] = useState(false)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const [deleteError, setDeleteError] = useState('')
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null)

  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    async function loadInitial() {
      setError('')
      setIsLoading(true)
      try {
        const result = await getConversations()
        setConversations(result.conversations)
        setNextCursor(result.nextCursor)
        setHasNext(result.hasNext)
      } catch (err) {
        setError(formatError(err))
      } finally {
        setIsLoading(false)
      }
    }
    loadInitial()
  }, [])

  async function loadMore() {
    if (!hasNext || isLoading) return
    setError('')
    setIsLoading(true)
    try {
      const result = await getConversations(nextCursor)
      setConversations((prev) => [...prev, ...result.conversations])
      setNextCursor(result.nextCursor)
      setHasNext(result.hasNext)
    } catch (err) {
      setError(formatError(err))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(targetId: number, activeConversationId: number | null) {
    if (deleteLoadingId !== null) return
    setDeleteError('')
    setDeleteLoadingId(targetId)
    try {
      await deleteConversation(targetId)
      setConversations((prev) => prev.filter((item) => item.conversationId !== targetId))
      setStatus('대화를 삭제했습니다.')
      if (activeConversationId === targetId) {
        navigate('/chat')
      }
    } catch (err) {
      setDeleteError(formatError(err))
    } finally {
      setDeleteLoadingId(null)
    }
  }

  async function handleCreate(title: string): Promise<boolean> {
    setCreateError('')
    setCreateLoading(true)
    try {
      const result = await createConversation(title.trim() || '새 대화')
      navigate(`/chat/${result.conversationId}`)
      return true
    } catch (err) {
      setCreateError(formatError(err))
      return false
    } finally {
      setCreateLoading(false)
    }
  }

  return {
    conversations,
    hasNext,
    isLoading,
    status,
    error,
    deleteError,
    deleteLoadingId,
    loadMore,
    handleDelete,
    handleCreate,
    createLoading,
    createError,
  }
}
