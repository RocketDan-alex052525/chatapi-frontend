import { useState } from 'react'
import { formatError } from '../../../shared/utils/formatError'
import type { Message } from '../../conversation/types'
import { sendChatCompletion, streamChatCompletion } from '../api'

type UseChatResult = {
  chatInput: string
  setChatInput: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
  status: string
  error: string
  streamingEnabled: boolean
  setStreamingEnabled: React.Dispatch<React.SetStateAction<boolean>>
  sendMessage: (
    conversationId: number,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  ) => Promise<void>
}

export function useChat(): UseChatResult {
  const [chatInput, setChatInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [streamingEnabled, setStreamingEnabled] = useState(false)

  async function sendMessage(
    conversationId: number,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  ) {
    const content = chatInput.trim()
    if (!content) return

    setError('')
    setStatus('')
    setIsLoading(true)

    setMessages((prev) => [...prev, { role: 'user', content }])
    setChatInput('')

    try {
      if (!streamingEnabled) {
        const result = await sendChatCompletion(conversationId, content)
        setMessages((prev) => [
          ...prev,
          { id: result.messageId, role: 'assistant', content: result.answer },
        ])
        setStatus('응답 수신')
      } else {
        const streamMessageId = Date.now()
        setMessages((prev) => [...prev, { id: streamMessageId, role: 'assistant', content: '' }])

        for await (const chunk of streamChatCompletion(conversationId, content)) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg,
            ),
          )
        }

        setStatus('스트리밍 응답 완료')
      }
    } catch (err) {
      const errMsg = formatError(err)
      setError(errMsg)
      setMessages((prev) => [...prev, { role: 'assistant', content: `오류: ${errMsg}` }])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    chatInput,
    setChatInput,
    isLoading,
    status,
    error,
    streamingEnabled,
    setStreamingEnabled,
    sendMessage,
  }
}
