import { useEffect, useRef, useState } from 'react'

type Props = {
  isOpen: boolean
  isLoading: boolean
  error: string
  onConfirm: (title: string) => void
  onClose: () => void
}

export default function CreateConversationModal({
  isOpen,
  isLoading,
  error,
  onConfirm,
  onClose,
}: Props) {
  const [title, setTitle] = useState('새 대화')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTitle('새 대화')
      setTimeout(() => inputRef.current?.select(), 0)
    }
  }, [isOpen])

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onConfirm(title)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <p className="modal__title">새 대화 만들기</p>
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>대화 제목</span>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </label>
          {error && <p className="status-text error">{error}</p>}
          <div className="modal__actions">
            <button type="button" className="secondary" onClick={onClose} disabled={isLoading}>
              취소
            </button>
            <button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? '생성 중...' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
