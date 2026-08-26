import { useState, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './LoginPage.css'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signIn, error } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!username || !password) return

    setIsSubmitting(true)
    try {
      await signIn(username, password)
    } catch {
      // Error is handled in AuthContext
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>🌴 Spain 2027</h1>
          <p>Villa Holiday Planner</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Your Name</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., alex_smith"
              autoComplete="username"
              disabled={isSubmitting}
            />
            <span className="form-hint">Use your username (e.g., first_last)</span>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="error-message">
              Invalid credentials. Please check your username and password.
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting || !username || !password}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Contact the trip organizer if you need access.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
