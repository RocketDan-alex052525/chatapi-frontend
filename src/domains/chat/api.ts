import { requestJson } from '../../shared/api/client'

export type ChatCompletionResponse = {
  messageId: number
  answer: string
}

export function sendChatCompletion(conversationId: number, content: string) {
  return requestJson<ChatCompletionResponse>('/api/chat/completions', {
    method: 'POST',
    body: { conversationId, content },
  })
}

export async function* streamChatCompletion(
  conversationId: number,
  content: string,
): AsyncGenerator<string> {
  const response = await fetch('/api/chat/completions/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, content }),
    credentials: 'include',
  })

  if (!response.ok || !response.body) {
    throw new Error(response.statusText || 'Stream request failed')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, '')
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trimStart()
      if (data === '[DONE]') return
      try {
        const parsed = JSON.parse(data) as { content?: string }
        if (parsed.content) yield parsed.content
      } catch {
        // ignore malformed chunks
      }
    }
  }
}
