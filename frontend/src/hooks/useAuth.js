import { useState, useEffect } from 'react'

function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ id: payload.userId, email: payload.email })
      } catch (err) {
        console.error('Invalid token:', err)
        logout()
      }
    }
  }, [token])

  const login = (newToken, userData) => {
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return { token, user, login, logout, isAuthenticated: !!token }
}

export default useAuth