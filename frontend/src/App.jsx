import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuth from './hooks/useAuth'
import useHistory from './hooks/useHistory'
import AuthForm from './components/AuthForm'
import Header from './components/Header'
import ConvertForm from './components/ConvertForm'
import ResultDisplay from './components/ResultDisplay'
import HistoryPanel from './components/HistoryPanel'
import './App.css'

function App() {
  const { token, user, login, logout, isAuthenticated } = useAuth()
  const { history, refreshHistory } = useHistory(token)
  const [result, setResult] = useState('')

  const handleConvert = (data, format) => {
    if (format === 'json') {
      setResult(JSON.stringify(data, null, 2))
    } else {
      setResult(typeof data === 'string' ? data : JSON.stringify(data))
    }
    refreshHistory()
  }

  const handleLogout = () => {
    logout()
    setResult('')
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthForm onLogin={login} />} />
        <Route 
          path="/convert" 
          element={
            isAuthenticated ? (
              <div className="container">
                <Header user={user} onLogout={handleLogout} />
                <div className="main-content">
                  <div className="converter-section">
                    <ConvertForm token={token} onConvert={handleConvert} />
                    <ResultDisplay result={result} />
                  </div>
                  <div className="history-section">
                    <h2>История конвертаций</h2>
                    <HistoryPanel history={history} />
                  </div>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/convert" : "/login"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App