import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ApiError,
  createConversation,
  login,
  registerApiKey,
  sendChatCompletion,
} from './api'
import './App.css'

type Message = {
  id?: number
  role: 'user' | 'assistant'
  content: string
}

type AuthInfo = {
  userId: number
  accessToken: string
  expiresInSeconds: number
}

function formatError(error: unknown) {
  if (error instanceof ApiError) {
    const code = error.code ? ` (${error.code})` : ''
    return `${error.message}${code}`
  }
  if (error instanceof Error) return error.message
  return '알 수 없는 오류가 발생했습니다.'
}

export default function App() {
  const [apiKey, setApiKey] = useState('')
  const [auth, setAuth] = useState<AuthInfo | null>(null)
  const [authStatus, setAuthStatus] = useState<string>('')
  const [authError, setAuthError] = useState<string>('')
  const [authLoading, setAuthLoading] = useState(false)

  const [conversationTitle, setConversationTitle] = useState('새 대화')
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [conversationStatus, setConversationStatus] = useState('')
  const [conversationError, setConversationError] = useState('')
  const [conversationLoading, setConversationLoading] = useState(false)

  const [messages, setMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatStatus, setChatStatus] = useState('')
  const [chatError, setChatError] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const isLoggedIn = Boolean(auth)
  const canChat = isLoggedIn && conversationId !== null

  const authSummary = useMemo(() => {
    if (!auth) return '미로그인'
    return `로그인됨 (userId=${auth.userId}, 만료 ${auth.expiresInSeconds}초)`
  }, [auth])

  async function handleRegister() {
    setAuthError('')
    setAuthStatus('')
    setAuthLoading(true)
    try {
      const result = await registerApiKey(apiKey.trim())
      setAuthStatus(`API 키 등록 완료 (userId=${result.userId})`)
    } catch (error) {
      setAuthError(formatError(error))
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleLogin() {
    setAuthError('')
    setAuthStatus('')
    setAuthLoading(true)
    try {
      const result = await login(apiKey.trim())
      setAuth(result)
      setAuthStatus(`로그인 완료 (userId=${result.userId})`)
    } catch (error) {
      setAuthError(formatError(error))
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleCreateConversation() {
    setConversationError('')
    setConversationStatus('')
    setConversationLoading(true)
    try {
      const result = await createConversation(conversationTitle.trim() || '새 대화')
      setConversationId(result.conversationId)
      setConversationStatus(`대화 생성 완료 (ID=${result.conversationId})`)
      setMessages([])
      setChatInput('')
    } catch (error) {
      setConversationError(formatError(error))
    } finally {
      setConversationLoading(false)
    }
  }

  async function handleSendChat() {
    if (!conversationId) return
    const content = chatInput.trim()
    if (!content) return

    setChatError('')
    setChatStatus('')
    setChatLoading(true)

    const userMessage: Message = { role: 'user', content }
    setMessages((prev) => [...prev, userMessage])
    setChatInput('')

    try {
      const result = await sendChatCompletion(conversationId, content)
      const assistantMessage: Message = {
        id: result.messageId,
        role: 'assistant',
        content: result.answer,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setChatStatus(`응답 수신 (messageId=${result.messageId})`)
    } catch (error) {
      const errorMessage = formatError(error)
      setChatError(errorMessage)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `오류: ${errorMessage}` },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="app__eyebrow">Rocketdan Frontend</p>
          <h1>대화 테스트 콘솔</h1>
          <p className="app__subtext">
            API 키 등록 → 로그인 → 대화 생성 → 채팅 흐름을 한 화면에서 검증합니다.
          </p>
        </div>
        <div className="app__status">
          <span className={isLoggedIn ? 'status status--ok' : 'status'}>{authSummary}</span>
          <p className="app__note">
            인증은 <code>ACCESS_TOKEN_COOKIE</code> 쿠키 기반이며 모든 <code>/api/**</code>
            요청은 <code>credentials: include</code>로 호출됩니다.
          </p>
        </div>
      </header>

      <section className="panel">
        <div className="panel__title">1. API 키 등록 / 로그인</div>
        <div className="panel__body">
          <label className="field">
            <span>OpenAI API 키</span>
            <input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
          </label>
          <div className="actions">
            <button disabled={authLoading || !apiKey.trim()} onClick={handleRegister}>
              {authLoading ? '처리 중...' : 'API 키 등록'}
            </button>
            <button
              className="secondary"
              disabled={authLoading || !apiKey.trim()}
              onClick={handleLogin}
            >
              {authLoading ? '처리 중...' : '로그인'}
            </button>
          </div>
          {authStatus && <p className="status-text ok">{authStatus}</p>}
          {authError && <p className="status-text error">{authError}</p>}
        </div>
      </section>

      <section className="panel">
        <div className="panel__title">2. 대화 생성</div>
        <div className="panel__body">
          <label className="field">
            <span>대화 제목</span>
            <input
              type="text"
              value={conversationTitle}
              onChange={(event) => setConversationTitle(event.target.value)}
            />
          </label>
          <div className="actions">
            <button disabled={!isLoggedIn || conversationLoading} onClick={handleCreateConversation}>
              {conversationLoading ? '생성 중...' : '대화 생성'}
            </button>
            {conversationId && (
              <span className="badge">현재 대화 ID: {conversationId}</span>
            )}
          </div>
          {conversationStatus && <p className="status-text ok">{conversationStatus}</p>}
          {conversationError && <p className="status-text error">{conversationError}</p>}
        </div>
      </section>

      <section className="panel">
        <div className="panel__title">3. 채팅 완성</div>
        <div className="panel__body">
          <div className="chat">
            <div className="chat__history">
              {messages.length === 0 && (
                <p className="chat__empty">아직 메시지가 없습니다. 질문을 입력해 주세요.</p>
              )}
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`chat__bubble chat__bubble--${message.role}`}
                >
                  <strong>{message.role === 'user' ? '나' : '어시스턴트'}</strong>
                  {message.role === 'assistant' ? (
                    <div className="markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="chat__composer">
              <textarea
                rows={3}
                placeholder={
                  canChat
                    ? '메시지를 입력하고 전송하세요.'
                    : '로그인 후 대화를 생성해야 전송할 수 있습니다.'
                }
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                disabled={!canChat || chatLoading}
              />
              <button
                disabled={!canChat || chatLoading || !chatInput.trim()}
                onClick={handleSendChat}
              >
                {chatLoading ? '전송 중...' : '전송'}
              </button>
            </div>
            {chatStatus && <p className="status-text ok">{chatStatus}</p>}
            {chatError && <p className="status-text error">{chatError}</p>}
            <p className="app__note">
              현재 백엔드는 이전 대화 히스토리를 모델에 전달하지 않으므로, 같은 대화 ID로
              보내더라도 응답은 독립적으로 생성됩니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
