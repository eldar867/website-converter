function ResultDisplay({ result }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    alert('Скопировано в буфер обмена!')
  }

  if (!result) return null

  return (
    <div className="result">
      <h3>Результат:</h3>
      <pre>{result}</pre>
      <button onClick={handleCopy} className="copy-button">
        Копировать
      </button>
    </div>
  )
}

export default ResultDisplay