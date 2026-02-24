type Props = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isLoading: boolean
  canChat: boolean
  streamingEnabled: boolean
  onStreamingToggle: (enabled: boolean) => void
  status: string
  error: string
}

export default function ChatComposer({
  value,
  onChange,
  onSend,
  isLoading,
  canChat,
  streamingEnabled,
  onStreamingToggle,
  status,
  error,
}: Props) {
  return (
    <div className="chat__composer">
      <label className="chat__toggle">
        <input
          type="checkbox"
          checked={streamingEnabled}
          onChange={(e) => onStreamingToggle(e.target.checked)}
        />
        <span>스트리밍 모드</span>
      </label>
      <textarea
        rows={3}
        placeholder={
          canChat
            ? '메시지를 입력하고 전송하세요.'
            : '로그인 후 대화를 생성해야 전송할 수 있습니다.'
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!canChat || isLoading}
      />
      <button disabled={!canChat || isLoading || !value.trim()} onClick={onSend}>
        {isLoading ? '전송 중...' : '전송'}
      </button>
      {status && <p className="status-text ok">{status}</p>}
      {error && <p className="status-text error">{error}</p>}
    </div>
  )
}
