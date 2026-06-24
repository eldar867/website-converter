function HistoryPanel({ history }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU')
  }

  if (history.length === 0) {
    return <p className="empty-history">История пуста</p>
  }

  return (
    <div className="history-list">
      {history.map((item) => (
        <div key={item.id} className="history-item">
          <div className="history-url">{item.url}</div>
          <div className="history-meta">
            <span className="format-badge">{item.format.toUpperCase()}</span>
            <span className="date">{formatDate(item.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default HistoryPanel