import { useState, useEffect } from 'react'
import axios from 'axios'

function useHistory(token) {
  const [history, setHistory] = useState([])

  const loadHistory = async () => {
    if (!token) return
    
    try {
      const response = await axios.get('/api/history', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistory(response.data.conversions)
    } catch (err) {
      console.error('History load error:', err)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [token])

  return { history, refreshHistory: loadHistory }
}

export default useHistory