import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import ChatComposer from '../components/ChatComposer/ChatComposer'
import ConversationList from '../components/ConversationList/ConversationList'
import MessageList from '../components/MessageList/MessageList'
import { useAuth } from '../domains/auth'
import { useChat } from '../domains/chat'
import { useConversationList, useConversationMessages } from '../domains/conversation'

export default function ChatPage() {
  const { auth } = useAuth()
  const { conversationId: conversationIdParam } = useParams()

  const activeConversationId = useMemo(() => {
    if (!conversationIdParam) return null
    const parsed = Number(conversationIdParam)
    return Number.isFinite(parsed) ? parsed : null
  }, [conversationIdParam])

  const isLoggedIn = Boolean(auth)
  const canChat = isLoggedIn && activeConversationId !== null

  const conversationList = useConversationList()
  const messageList = useConversationMessages(activeConversationId)
  const chat = useChat()

  const [conversationTitle, setConversationTitle] = useState('새 대화')

  return (
    <section className="panel">
      <div className="panel__title">채팅</div>
      <div className="chat-layout">

        <aside className="chat-layout__sidebar">
          <p className="panel__summary">현재 상태: {isLoggedIn ? '로그인됨' : '미로그인'}</p>
          {!isLoggedIn && (
            <p className="status-text error">로그인 후 대화를 생성할 수 있습니다.</p>
          )}

          <ConversationList
            conversations={conversationList.conversations}
            activeConversationId={activeConversationId}
            hasNext={conversationList.hasNext}
            isLoading={conversationList.isLoading}
            deleteLoadingId={conversationList.deleteLoadingId}
            status={conversationList.status}
            error={conversationList.error}
            deleteError={conversationList.deleteError}
            onLoadMore={conversationList.loadMore}
            onDelete={(id) => conversationList.handleDelete(id, activeConversationId)}
          />

          <div className="sidebar__create">
            <label className="field">
              <span>대화 제목</span>
              <input
                type="text"
                value={conversationTitle}
                onChange={(e) => setConversationTitle(e.target.value)}
              />
            </label>
            <div className="actions">
              <button
                disabled={!isLoggedIn || conversationList.createLoading}
                onClick={() => conversationList.handleCreate(conversationTitle)}
              >
                {conversationList.createLoading ? '생성 중...' : '대화 생성'}
              </button>
            </div>
            {conversationList.createError && (
              <p className="status-text error">{conversationList.createError}</p>
            )}
          </div>
        </aside>

        <main className="chat-layout__main">
          <div className="chat">
            <MessageList
              activeConversationId={activeConversationId}
              messages={messageList.messages}
              hasNext={messageList.hasNext}
              isLoading={messageList.isLoading}
              onLoadMore={messageList.loadMore}
            />
            <ChatComposer
              value={chat.chatInput}
              onChange={chat.setChatInput}
              onSend={() =>
                activeConversationId !== null &&
                chat.sendMessage(activeConversationId, messageList.setMessages)
              }
              isLoading={chat.isLoading}
              canChat={canChat}
              streamingEnabled={chat.streamingEnabled}
              onStreamingToggle={chat.setStreamingEnabled}
              status={chat.status}
              error={chat.error}
            />
            {messageList.status && <p className="status-text ok">{messageList.status}</p>}
            {messageList.error && <p className="status-text error">{messageList.error}</p>}
          </div>
        </main>

      </div>
    </section>
  )
}
