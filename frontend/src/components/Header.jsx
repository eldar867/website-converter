function Header({ user, onLogout }) {
  return (
    <header className="header">
      <h1>Конвертер сайтов</h1>
      <div className="user-info">
        <span>{user?.email}</span>
        <button onClick={onLogout} className="logout-btn">
          Выйти
        </button>
      </div>
    </header>
  )
}

export default Header