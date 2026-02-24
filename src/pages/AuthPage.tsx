import { useState } from 'react'
import { login, registerApiKey } from '../domains/auth'
import { useAuth } from '../domains/auth'
import { formatError } from '../shared/utils/formatError'

export default function AuthPage() {
  const { auth, setAuth } = useAuth()
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const authSummary = auth ? '로그인됨' : '미로그인'

  async function handleRegister() {
    setError('')
    setStatus('')
    setIsLoading(true)
    try {
      await registerApiKey(apiKey.trim())
      setStatus('API 키 등록 완료')
      setApiKey('')
    } catch (err) {
      setError(formatError(err))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogin() {
    setError('')
    setStatus('')
    setIsLoading(true)
    try {
      const result = await login(apiKey.trim())
      setAuth(result)
      setStatus('로그인 완료')
      setApiKey('')
    } catch (err) {
      setError(formatError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="panel">
      <div className="panel__title">API 키 등록 / 로그인</div>
      <div className="panel__body">
        <p className="panel__summary">현재 상태: {authSummary}</p>
        <label className="field">
          <span>OpenAI API 키</span>
          <input
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </label>
        <div className="actions">
          <button disabled={isLoading || !apiKey.trim()} onClick={handleRegister}>
            {isLoading ? '처리 중...' : 'API 키 등록'}
          </button>
          <button
            className="secondary"
            disabled={isLoading || !apiKey.trim()}
            onClick={handleLogin}
          >
            {isLoading ? '처리 중...' : '로그인'}
          </button>
        </div>
        {status && <p className="status-text ok">{status}</p>}
        {error && <p className="status-text error">{error}</p>}
      </div>
    </section>
  )
}
