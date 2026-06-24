import { useState } from 'react'
import axios from 'axios'

function ConvertForm({ token, onConvert }) {
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState('json')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConvert = async () => {
    if (!url.trim()) {
      setError('Введите URL сайта')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post(
        '/api/convert',
        { url: url.trim(), format },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onConvert(response.data, format)
    } catch (err) {
      setError('Ошибка: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form">
      <input
        type="url"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="input"
      />
      <select 
        value={format} 
        onChange={(e) => setFormat(e.target.value)} 
        className="select"
      >
        <option value="json">JSON</option>
        <option value="csv">CSV</option>
        <option value="xml">XML</option>
      </select>
      <button 
        onClick={handleConvert} 
        disabled={loading} 
        className="button"
      >
        {loading ? 'Конвертирую...' : 'Конвертировать'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  )
}

export default ConvertForm