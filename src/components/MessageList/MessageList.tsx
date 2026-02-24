import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '../../domains/conversation/types'

type Props = {
  activeConversationId: number | null
  messages: Message[]
  hasNext: boolean
  isLoading: boolean
  onLoadMore: () => void
}

export default function MessageList({
  activeConversationId,
  messages,
  hasNext,
  isLoading,
  onLoadMore,
}: Props) {
  return (
    <div className="chat__history">
      {!activeConversationId && (
        <p className="chat__empty">대화를 선택하면 메시지를 볼 수 있습니다.</p>
      )}
      {activeConversationId && messages.length === 0 && (
        <p className="chat__empty">아직 메시지가 없습니다. 질문을 입력해 주세요.</p>
      )}
      {activeConversationId && hasNext && (
        <button className="secondary chat__more" onClick={onLoadMore} disabled={isLoading}>
          {isLoading ? '불러오는 중...' : '메시지 더보기'}
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
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
            ) : (
              <p>{message.content}</p>
            )}
          </div>
        ))}
    </div>
  )
}
