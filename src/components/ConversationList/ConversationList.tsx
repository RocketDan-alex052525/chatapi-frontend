import { useNavigate } from 'react-router-dom'
import type { ConversationSummary } from '../../domains/conversation/types'

type Props = {
  conversations: ConversationSummary[]
  activeConversationId: number | null
  hasNext: boolean
  isLoading: boolean
  deleteLoadingId: number | null
  status: string
  error: string
  deleteError: string
  onLoadMore: () => void
  onDelete: (conversationId: number) => void
}

export default function ConversationList({
  conversations,
  activeConversationId,
  hasNext,
  isLoading,
  deleteLoadingId,
  status,
  error,
  deleteError,
  onLoadMore,
  onDelete,
}: Props) {
  const navigate = useNavigate()

  return (
    <div className="panel__section">
      <div className="section__header">
        <span>대화 목록</span>
        {hasNext && (
          <button className="secondary" onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? '불러오는 중...' : '더보기'}
          </button>
        )}
      </div>
      <div className="conversation-list">
        {conversations.length === 0 && !isLoading && (
          <p className="conversation-empty">대화가 없습니다.</p>
        )}
        {conversations.map((item, index) => (
          <div
            key={`${item.conversationId}-${index}`}
            className={`conversation-item${activeConversationId === item.conversationId ? ' active' : ''}`}
          >
            <button
              className="conversation-link"
              onClick={() => navigate(`/chat/${item.conversationId}`)}
            >
              <span className="conversation-title">{item.title}</span>
            </button>
            <button
              className="secondary conversation-delete"
              onClick={() => onDelete(item.conversationId)}
              disabled={deleteLoadingId === item.conversationId}
            >
              {deleteLoadingId === item.conversationId ? '삭제 중...' : '삭제'}
            </button>
          </div>
        ))}
      </div>
      {status && <p className="status-text ok">{status}</p>}
      {error && <p className="status-text error">{error}</p>}
      {deleteError && <p className="status-text error">{deleteError}</p>}
    </div>
  )
}
