import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, usernameToEmail, isDemoMode } from '../config/firebase'
import { User } from '../types'

// Demo user for testing without Firebase
const DEMO_USER: User = {
  uid: 'demo_user_1',
  username: 'demo_user',
  displayName: 'Demo User',
  role: 'admin',
  budgetCap: 350,
  preferences: [],
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null
  user: User | null
  loading: boolean
  error: string | null
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
  isDemoMode: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(isDemoMode ? DEMO_USER : null)
  const [loading, setLoading] = useState(!isDemoMode)
  const [error, setError] = useState<string | null>(null)

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string): Promise<User | null> => {
    if (isDemoMode) return DEMO_USER
    
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        return userDoc.data() as User
      }
      return null
    } catch (err) {
      console.error('Error fetching user profile:', err)
      return null
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    // Skip Firebase auth in demo mode
    if (isDemoMode) {
      setLoading(false)
      return
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser)

        if (fbUser) {
          const profile = await fetchUserProfile(fbUser.uid)
          setUser(profile)
        } else {
          setUser(null)
        }

        setLoading(false)
      })

      return () => unsubscribe()
    } catch (err) {
      console.error('Auth state listener error:', err)
      setLoading(false)
    }
  }, [])

  // Sign in with username (converted to synthetic email) and password
  const signIn = async (username: string, password: string) => {
    // Demo mode: instant sign in
    if (isDemoMode) {
      setUser({
        ...DEMO_USER,
        username: username,
        displayName: username.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      })
      return
    }

    setError(null)
    setLoading(true)

    try {
      const email = usernameToEmail(username)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    if (isDemoMode) {
      setUser(null)
      return
    }

    try {
      await firebaseSignOut(auth)
      setUser(null)
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  const isAdmin = user?.role === 'admin'

  const value: AuthContextType = {
    firebaseUser,
    user,
    loading,
    error,
    signIn,
    signOut,
    isAdmin,
    isDemoMode,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
