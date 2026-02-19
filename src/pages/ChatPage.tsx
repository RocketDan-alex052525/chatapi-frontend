import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  createConversation,
  deleteConversation,
  getConversationMessages,
  getConversations,
  sendChatCompletion,
} from '../api'
import { useAuth } from '../auth'
import { formatError } from '../utils'

type Message = {
  id?: number
  role: 'user' | 'assistant'
  content: string
}

type ConversationItem = {
  conversationId: number
  title: string
}

function normalizeMessageRole(role: string): 'user' | 'assistant' {
  const normalized = role.trim().toLowerCase()
  if (normalized === 'assistant' || normalized === 'ai' || normalized === 'bot') {
    return 'assistant'
  }
  if (normalized === 'user' || normalized === 'human') {
    return 'user'
  }
  return 'assistant'
}

export default function ChatPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const { conversationId: conversationIdParam } = useParams()

  const [conversationTitle, setConversationTitle] = useState('새 대화')
  const [conversationStatus, setConversationStatus] = useState('')
  const [conversationError, setConversationError] = useState('')
  const [conversationLoading, setConversationLoading] = useState(false)

  const [messages, setMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatStatus, setChatStatus] = useState('')
  const [chatError, setChatError] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [listStatus, setListStatus] = useState('')
  const [listError, setListError] = useState('')
  const [listLoading, setListLoading] = useState(false)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [hasNext, setHasNext] = useState(false)

  const [messageNextCursor, setMessageNextCursor] = useState<number | null>(null)
  const [messageHasNext, setMessageHasNext] = useState(false)
  const [messageLoading, setMessageLoading] = useState(false)
  const [messageError, setMessageError] = useState('')
  const [messageStatus, setMessageStatus] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null)

  const isLoggedIn = Boolean(auth)
  const activeConversationId = useMemo(() => {
    if (!conversationIdParam) return null
    const parsed = Number(conversationIdParam)
    if (!Number.isFinite(parsed)) return null
    return parsed
  }, [conversationIdParam])
  const canChat = isLoggedIn && activeConversationId !== null

  const authSummary = useMemo(() => {
    if (!auth) return '미로그인'
    return `로그인됨 (userId=${auth.userId})`
  }, [auth])

  useEffect(() => {
    async function loadInitial() {
      setListError('')
      setListStatus('')
      setListLoading(true)
      try {
        const result = await getConversations()
        setConversations(result.conversations)
        setNextCursor(result.nextCursor)
        setHasNext(result.hasNext)
        setListStatus(`대화 ${result.conversations.length}건 불러옴`)
      } catch (error) {
        setListError(formatError(error))
      } finally {
        setListLoading(false)
      }
    }

    loadInitial()
  }, [])

  useEffect(() => {
    async function loadMessages() {
      if (!activeConversationId) {
        setMessages([])
        setMessageNextCursor(null)
        setMessageHasNext(false)
        setMessageError('')
        setMessageStatus('')
        return
      }
      setMessageError('')
      setMessageStatus('')
      setMessageLoading(true)
      try {
        const result = await getConversationMessages(activeConversationId)
        const ordered = [...result.messages].reverse()
        setMessages(
          ordered.map((message, index) => ({
            id: index,
            role: normalizeMessageRole(message.role),
            content: message.content,
          })),
        )
        setMessageNextCursor(result.nextCursor)
        setMessageHasNext(result.hasNext)
        setMessageStatus(`메시지 ${result.messages.length}건 불러옴`)
      } catch (error) {
        setMessageError(formatError(error))
      } finally {
        setMessageLoading(false)
      }
    }

    loadMessages()
  }, [activeConversationId])

  async function handleLoadMore() {
    if (!hasNext || listLoading) return
    setListError('')
    setListStatus('')
    setListLoading(true)
    try {
      const result = await getConversations(nextCursor)
      setConversations((prev) => [...prev, ...result.conversations])
      setNextCursor(result.nextCursor)
      setHasNext(result.hasNext)
      setListStatus(`대화 ${result.conversations.length}건 추가`)
    } catch (error) {
      setListError(formatError(error))
    } finally {
      setListLoading(false)
    }
  }

  async function handleLoadMoreMessages() {
    if (!activeConversationId || !messageHasNext || messageLoading) return
    setMessageError('')
    setMessageStatus('')
    setMessageLoading(true)
    try {
      const result = await getConversationMessages(activeConversationId, messageNextCursor)
      const ordered = [...result.messages].reverse()
      setMessages((prev) => [
        ...ordered.map((message, index) => ({
          id: prev.length + index,
          role: normalizeMessageRole(message.role),
          content: message.content,
        })),
        ...prev,
      ])
      setMessageNextCursor(result.nextCursor)
      setMessageHasNext(result.hasNext)
      setMessageStatus(`메시지 ${result.messages.length}건 추가`)
    } catch (error) {
      setMessageError(formatError(error))
    } finally {
      setMessageLoading(false)
    }
  }

  async function handleDeleteConversation(targetId: number) {
    if (deleteLoadingId !== null) return
    setDeleteError('')
    setDeleteLoadingId(targetId)
    try {
      await deleteConversation(targetId)
      setConversations((prev) => prev.filter((item) => item.conversationId !== targetId))
      setListStatus('대화를 삭제했습니다.')
      if (activeConversationId === targetId) {
        navigate('/chat')
        setMessages([])
        setMessageHasNext(false)
        setMessageNextCursor(null)
      }
    } catch (error) {
      setDeleteError(formatError(error))
    } finally {
      setDeleteLoadingId(null)
    }
  }

  async function handleCreateConversation() {
    setConversationError('')
    setConversationStatus('')
    setConversationLoading(true)
    try {
      const result = await createConversation(conversationTitle.trim() || '새 대화')
      setConversationStatus(`대화 생성 완료 (ID=${result.conversationId})`)
      setMessages([])
      setChatInput('')
      navigate(`/chat/${result.conversationId}`)
      setListStatus('새 대화를 생성했습니다. 필요하면 목록을 새로고침하세요.')
    } catch (error) {
      setConversationError(formatError(error))
    } finally {
      setConversationLoading(false)
    }
  }

  async function handleSendChat() {
    if (!activeConversationId) return
    const content = chatInput.trim()
    if (!content) return

    setChatError('')
    setChatStatus('')
    setChatLoading(true)

    const userMessage: Message = { role: 'user', content }
    setMessages((prev) => [...prev, userMessage])
    setChatInput('')

    try {
      const result = await sendChatCompletion(activeConversationId, content)
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
    <section className="panel">
      <div className="panel__title">채팅</div>
      <div className="panel__body">
        <p className="panel__summary">현재 상태: {authSummary}</p>
        {!isLoggedIn && (
          <p className="status-text error">로그인 후 대화를 생성할 수 있습니다.</p>
        )}

        <div className="panel__section">
          <div className="section__header">
            <span>대화 목록</span>
            {hasNext && (
              <button className="secondary" onClick={handleLoadMore} disabled={listLoading}>
                {listLoading ? '불러오는 중...' : '더보기'}
              </button>
            )}
          </div>
          <div className="conversation-list">
            {conversations.length === 0 && !listLoading && (
              <p className="conversation-empty">대화가 없습니다.</p>
            )}
            {conversations.map((item, index) => (
              <div
                key={`${item.conversationId}-${index}`}
                className={`conversation-item${
                  activeConversationId === item.conversationId ? ' active' : ''
                }`}
              >
                <button
                  className="conversation-link"
                  onClick={() => navigate(`/chat/${item.conversationId}`)}
                >
                  <span className="conversation-title">{item.title}</span>
                </button>
                <button
                  className="secondary conversation-delete"
                  onClick={() => handleDeleteConversation(item.conversationId)}
                  disabled={deleteLoadingId === item.conversationId}
                >
                  {deleteLoadingId === item.conversationId ? '삭제 중...' : '삭제'}
                </button>
              </div>
            ))}
          </div>
          {listStatus && <p className="status-text ok">{listStatus}</p>}
          {listError && <p className="status-text error">{listError}</p>}
          {deleteError && <p className="status-text error">{deleteError}</p>}
        </div>

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
          {activeConversationId && (
            <span className="badge">현재 대화 ID: {activeConversationId}</span>
          )}
        </div>
        {conversationStatus && <p className="status-text ok">{conversationStatus}</p>}
        {conversationError && <p className="status-text error">{conversationError}</p>}

        <div className="chat">
          <div className="chat__history">
            {!activeConversationId && (
              <p className="chat__empty">대화를 선택하면 메시지를 볼 수 있습니다.</p>
            )}
            {activeConversationId && messages.length === 0 && (
              <p className="chat__empty">아직 메시지가 없습니다. 질문을 입력해 주세요.</p>
            )}
            {activeConversationId && messageHasNext && (
              <button
                className="secondary chat__more"
                onClick={handleLoadMoreMessages}
                disabled={messageLoading}
              >
                {messageLoading ? '불러오는 중...' : '메시지 더보기'}
              </button>
            )}
            {activeConversationId &&
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`chat__bubble chat__bubble--${message.role}`}
                >
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
            <button disabled={!canChat || chatLoading || !chatInput.trim()} onClick={handleSendChat}>
              {chatLoading ? '전송 중...' : '전송'}
            </button>
          </div>
          {messageStatus && <p className="status-text ok">{messageStatus}</p>}
          {messageError && <p className="status-text error">{messageError}</p>}
          {chatStatus && <p className="status-text ok">{chatStatus}</p>}
          {chatError && <p className="status-text error">{chatError}</p>}
          {/* <p className="app__note">
            현재 백엔드는 이전 대화 히스토리를 모델에 전달하지 않으므로, 같은 대화 ID로
            보내더라도 응답은 독립적으로 생성됩니다.
          </p> */}
        </div>
      </div>
    </section>
  )
}
