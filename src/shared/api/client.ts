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

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers ?? {}) }

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
