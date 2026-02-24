import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import ChatComposer from '../components/ChatComposer/ChatComposer'
import ConversationList from '../components/ConversationList/ConversationList'
import CreateConversationModal from '../components/CreateConversationModal/CreateConversationModal'
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

  const [isModalOpen, setIsModalOpen] = useState(false)

  // 대화 선택 or 새 메시지 append 시 최하단으로 스크롤
  // load more(prepend)는 마지막 메시지가 바뀌지 않으므로 스크롤 미발생
  const lastMsg = messageList.messages[messageList.messages.length - 1]
  const scrollToBottomKey = `${activeConversationId ?? 'none'}-${lastMsg?.id ?? lastMsg?.content.slice(0, 8)}`

  async function handleCreateConfirm(title: string) {
    const success = await conversationList.handleCreate(title)
    if (success) setIsModalOpen(false)
  }

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
            <button
              disabled={!isLoggedIn}
              onClick={() => setIsModalOpen(true)}
            >
              새 대화
            </button>
          </div>
        </aside>

        <main className="chat-layout__main">
          <div className="chat">
            <MessageList
              activeConversationId={activeConversationId}
              messages={messageList.messages}
              hasNext={messageList.hasNext}
              isLoading={messageList.isLoading}
              scrollToBottomKey={scrollToBottomKey}
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

      <CreateConversationModal
        isOpen={isModalOpen}
        isLoading={conversationList.createLoading}
        error={conversationList.createError}
        onConfirm={handleCreateConfirm}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  )
}
