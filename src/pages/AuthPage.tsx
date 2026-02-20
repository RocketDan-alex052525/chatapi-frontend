import { useMemo, useState } from 'react'
import { login, registerApiKey } from '../api'
import { useAuth } from '../auth'
import { formatError } from '../utils'

export default function AuthPage() {
  const { auth, setAuth } = useAuth()
  const [apiKey, setApiKey] = useState('')
  const [authStatus, setAuthStatus] = useState<string>('')
  const [authError, setAuthError] = useState<string>('')
  const [authLoading, setAuthLoading] = useState(false)

  const authSummary = useMemo(() => {
    if (!auth) return '미로그인'
    return '로그인됨'
  }, [auth])

  async function handleRegister() {
    setAuthError('')
    setAuthStatus('')
    setAuthLoading(true)
    try {
      const result = await registerApiKey(apiKey.trim())
      setAuthStatus('API 키 등록 완료')
      setApiKey('')
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
      setAuthStatus('로그인 완료')
      setApiKey('')
    } catch (error) {
      setAuthError(formatError(error))
    } finally {
      setAuthLoading(false)
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
        {/* <p className="app__note">
          인증은 <code>ACCESS_TOKEN_COOKIE</code> 쿠키 기반이며 모든 <code>/api/**</code> 요청은
          <code>credentials: include</code>로 호출됩니다.
        </p> */}
      </div>
    </section>
  )
}
