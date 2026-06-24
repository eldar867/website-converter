import { useState } from 'react'
import axios from 'axios'

function AuthForm({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
      const response = await axios.post(endpoint, { email, password })

      if (isRegister) {
        alert('Регистрация успешна! Теперь войдите.')
        setIsRegister(false)
        setEmail('')
        setPassword('')
        setLoading(false)
      } else {
        // Сохраняем токен
        localStorage.setItem('token', response.data.token)
        
        // Вызываем onLogin для обновления состояния в App
        onLogin(response.data.token, response.data.user)
        
        // Принудительный редирект на /convert
        window.location.href = '/convert'
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка авторизации')
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsRegister(!isRegister)
    setError('')
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Конвертер сайтов</h1>
        <h2>{isRegister ? 'Регистрация' : 'Вход'}</h2>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Загрузка...' : (isRegister ? 'Зарегистрироваться' : 'Войти')}
          </button>
        </form>
        
        <p>
          {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
          <button onClick={toggleMode} disabled={loading}>
            {isRegister ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthForm