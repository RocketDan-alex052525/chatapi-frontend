import { createContext, useContext, useMemo, useState } from 'react'

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthInfo | null>(null)
  const value = useMemo(() => ({ auth, setAuth }), [auth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
