import { useState, FormEvent } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

function Layout() {
  const { user, signOut, changePassword, isAdmin, isDemoMode } = useAuth()
  const navigate = useNavigate()

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // User menu dropdown state
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const openPasswordModal = () => {
    setShowUserMenu(false)
    setShowPasswordModal(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError(null)
    setPasswordSuccess(false)
  }

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError(null)
    setPasswordSuccess(false)
  }

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    // Validation
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password')
      return
    }

    setIsChangingPassword(true)

    try {
      await changePassword(currentPassword, newPassword)
      setPasswordSuccess(true)
      // Close modal after showing success
      setTimeout(() => {
        closePasswordModal()
      }, 2000)
    } catch (err) {
      console.error('Password change failed:', err)
      if (err instanceof Error && err.message.includes('wrong-password')) {
        setPasswordError('Current password is incorrect')
      } else {
        setPasswordError(err instanceof Error ? err.message : 'Password change failed')
      }
    } finally {
      setIsChangingPassword(false)
    }
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
          <div className="user-menu-container">
            <button 
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <span className="user-info">
                {user?.displayName}
                {isAdmin && <span className="admin-badge">Admin</span>}
              </span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {showUserMenu && (
              <>
                <div className="user-menu-backdrop" onClick={() => setShowUserMenu(false)} />
                <div className="user-menu-dropdown">
                  <button onClick={openPasswordModal} className="user-menu-item">
                    🔑 Change Password
                  </button>
                  <hr className="user-menu-divider" />
                  <button onClick={handleSignOut} className="user-menu-item user-menu-item-danger">
                    🚪 Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={closePasswordModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button className="modal-close" onClick={closePasswordModal}>×</button>
            </div>

            {passwordSuccess ? (
              <div className="modal-body">
                <div className="success-message">
                  Password changed successfully!
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="current-password">Current Password</label>
                    <input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                      autoFocus
                      disabled={isChangingPassword}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      disabled={isChangingPassword}
                      required
                    />
                    <span className="form-hint">At least 6 characters</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirm-new-password">Confirm New Password</label>
                    <input
                      id="confirm-new-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      disabled={isChangingPassword}
                      required
                    />
                  </div>

                  {passwordError && (
                    <div className="error-message">{passwordError}</div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closePasswordModal}
                    disabled={isChangingPassword}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout
