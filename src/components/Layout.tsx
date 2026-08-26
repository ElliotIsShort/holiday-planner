import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

function Layout() {
  const { user, signOut, isAdmin, isDemoMode } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="layout">
      {isDemoMode && (
        <div className="demo-banner">
          Demo Mode - Data is stored locally. Set up Firebase to persist data.
        </div>
      )}
      <header className="header">
        <div className="header-left">
          <h1 className="logo">🌴 Spain 2027</h1>
          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Dashboard
            </NavLink>
            <NavLink to="/villas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Villas
            </NavLink>
            <NavLink to="/availability" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Availability
            </NavLink>
            <NavLink to="/activities" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Activities
            </NavLink>
          </nav>
        </div>
        <div className="header-right">
          <span className="user-info">
            {user?.displayName}
            {isAdmin && <span className="admin-badge">Admin</span>}
          </span>
          <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
            Sign Out
          </button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
