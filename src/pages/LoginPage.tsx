import { useState, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Invitation } from '../types'
import './LoginPage.css'

type LoginStep = 'username' | 'password' | 'setup'

function LoginPage() {
  const [step, setStep] = useState<LoginStep>('username')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const { signIn, checkUserInvitation, claimInvitationAndCreateAccount, error } = useAuth()

  // Step 1: Check if username exists as invitation or existing user
  const handleUsernameSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setIsSubmitting(true)
    setLocalError(null)

    try {
      // Check for unclaimed invitation first
      const inv = await checkUserInvitation(username)
      
      if (inv) {
        // New user with invitation - go to setup flow
        setInvitation(inv)
        setStep('setup')
      } else {
        // Existing user or no invitation - go to password step
        setStep('password')
      }
    } catch (err) {
      console.error('Error checking username:', err)
      setLocalError('Error checking username. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 2a: Login with password (existing user)
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!username || !password) return

    setIsSubmitting(true)
    setLocalError(null)

    try {
      await signIn(username, password)
    } catch (err) {
      console.error('Login failed:', err)
      setLocalError('Invalid credentials. Please check your username and password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 2b: Set up password (new user with invitation)
  const handleSetupSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!username || !password || !confirmPassword || !invitation) return

    // Validate passwords match
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    setIsSubmitting(true)
    setLocalError(null)

    try {
      await claimInvitationAndCreateAccount(username, password, invitation)
    } catch (err) {
      console.error('Account setup failed:', err)
      setLocalError(err instanceof Error ? err.message : 'Account setup failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Go back to username step
  const handleBack = () => {
    setStep('username')
    setPassword('')
    setConfirmPassword('')
    setInvitation(null)
    setLocalError(null)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>🌴 Spain 2027</h1>
          <p>Villa Holiday Planner</p>
        </div>

        {/* Step 1: Enter Username */}
        {step === 'username' && (
          <form onSubmit={handleUsernameSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Your Name</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., alex_smith"
                autoComplete="username"
                autoFocus
                disabled={isSubmitting}
              />
              <span className="form-hint">Use your username (e.g., first_last)</span>
            </div>

            {localError && (
              <div className="error-message">{localError}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isSubmitting || !username.trim()}
            >
              {isSubmitting ? 'Checking...' : 'Continue'}
            </button>

            <div className="login-footer">
              <p>Contact the trip organizer if you need access.</p>
            </div>
          </form>
        )}

        {/* Step 2a: Enter Password (existing user) */}
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="login-form">
            <div className="step-header">
              <button type="button" className="back-link" onClick={handleBack}>
                ← Back
              </button>
              <p className="welcome-text">Welcome back, <strong>{username}</strong></p>
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
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            {(error || localError) && (
              <div className="error-message">
                {localError || 'Invalid credentials. Please check your username and password.'}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isSubmitting || !password}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Step 2b: Set Up Password (new user) */}
        {step === 'setup' && invitation && (
          <form onSubmit={handleSetupSubmit} className="login-form">
            <div className="step-header">
              <button type="button" className="back-link" onClick={handleBack}>
                ← Back
              </button>
              <p className="welcome-text">
                Welcome, <strong>{invitation.displayName}</strong>!
              </p>
              <p className="setup-instruction">
                This is your first time signing in. Please create a password.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="new-password">Create Password</label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
                autoComplete="new-password"
                autoFocus
                disabled={isSubmitting}
              />
              <span className="form-hint">At least 6 characters</span>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                disabled={isSubmitting}
              />
            </div>

            {localError && (
              <div className="error-message">{localError}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isSubmitting || !password || !confirmPassword}
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default LoginPage
