export type RegisterResponse = {
  userId: number
}

export type LoginResponse = {
  userId: number
  accessToken: string
  expiresInSeconds: number
}

export type CreateConversationResponse = {
  conversationId: number
}

export type ChatCompletionResponse = {
  messageId: number
  answer: string
}

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

type RequestOptions = {
  method?: string
  headers?: Record<string, string>
  body?: unknown
}

async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  }

  let body: string | undefined
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.body)
  }

  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers,
    body,
    credentials: 'include',
  })

  if (!response.ok) {
    let message = response.statusText || 'Request failed'
    let code: string | undefined

    try {
      const data = (await response.json()) as {
        message?: string
        code?: string
        errorMessage?: string
        businessCode?: string
      }
      if (data?.errorMessage) message = data.errorMessage
      else if (data?.message) message = data.message
      if (data?.businessCode) code = data.businessCode
      else if (data?.code) code = data.code
    } catch {
      // ignore json parse errors
    }

    throw new ApiError(message, response.status, code)
  }

  if (response.status === 204) {
    return {} as T
  }

  return (await response.json()) as T
}

export function registerApiKey(apiKey: string) {
  return requestJson<RegisterResponse>('/api/auth/apiKey', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
    },
  })
}

export function login(apiKey: string) {
  return requestJson<LoginResponse>('/api/auth/login', {
    method: 'GET',
    headers: {
      'X-API-KEY': apiKey,
    },
  })
}

export function createConversation(title: string) {
  return requestJson<CreateConversationResponse>('/api/conversations', {
    method: 'POST',
    body: { title },
  })
}

export function sendChatCompletion(conversationId: number, content: string) {
  return requestJson<ChatCompletionResponse>('/api/chat/completions', {
    method: 'POST',
    body: { conversationId, content },
  })
}
