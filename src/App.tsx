import { NavLink, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'
import './App.css'

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <header className="app__header">
          <div>
            <p className="app__eyebrow">Rocketdan</p>
            <h1>ChatAPI</h1>
            <p className="app__subtext">
              챗봇 어시스턴트
            </p>
          </div>
          <div className="app__status">
            <nav className="app__nav">
              <NavLink to="/auth" className={({ isActive }) => (isActive ? 'nav active' : 'nav')}>
                인증
              </NavLink>
              <NavLink to="/chat" className={({ isActive }) => (isActive ? 'nav active' : 'nav')}>
                대화
              </NavLink>
            </nav>
            {/* <p className="app__note">
              기본 경로는 <code>/auth</code>입니다.
            </p> */}
          </div>
        </header>

        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
