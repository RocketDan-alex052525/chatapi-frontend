import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

export type AuthInfo = {
  userId: number
  accessToken: string
  expiresInSeconds: number
}

type AuthContextValue = {
  auth: AuthInfo | null
  setAuth: React.Dispatch<React.SetStateAction<AuthInfo | null>>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const STORAGE_KEY = 'rocketdan.auth'

type StoredAuth = {
  auth: AuthInfo
  expiresAt: number
}

function readStoredAuth(): { auth: AuthInfo | null; expiresAt: number | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { auth: null, expiresAt: null }
    const parsed = JSON.parse(raw) as StoredAuth
    if (!parsed?.auth || typeof parsed.expiresAt !== 'number') {
      localStorage.removeItem(STORAGE_KEY)
      return { auth: null, expiresAt: null }
    }
    if (Date.now() >= parsed.expiresAt) {
      localStorage.removeItem(STORAGE_KEY)
      return { auth: null, expiresAt: null }
    }
    return { auth: parsed.auth, expiresAt: parsed.expiresAt }
  } catch {
    return { auth: null, expiresAt: null }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const stored = readStoredAuth()
  const storedRef = useRef<{ accessToken: string; expiresAt: number } | null>(
    stored.auth && stored.expiresAt
      ? { accessToken: stored.auth.accessToken, expiresAt: stored.expiresAt }
      : null,
  )
  const [auth, setAuth] = useState<AuthInfo | null>(stored.auth)
  const value = useMemo(() => ({ auth, setAuth }), [auth])

  useEffect(() => {
    if (!auth) {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore storage errors
      }
      storedRef.current = null
      return
    }

    const storedSnapshot = storedRef.current
    const expiresAt =
      storedSnapshot && storedSnapshot.accessToken === auth.accessToken
        ? storedSnapshot.expiresAt
        : Date.now() + auth.expiresInSeconds * 1000

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          auth,
          expiresAt,
        } satisfies StoredAuth),
      )
    } catch {
      // ignore storage errors
    }

    storedRef.current = { accessToken: auth.accessToken, expiresAt }
  }, [auth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
