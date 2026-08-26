import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000',
}

// Check if we're using demo/placeholder config
export const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY || 
  import.meta.env.VITE_FIREBASE_API_KEY === 'demo-api-key'

let app: FirebaseApp
let auth: Auth
let db: Firestore

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  
  // If using emulators (optional - for local development)
  if (import.meta.env.VITE_USE_EMULATORS === 'true') {
    connectAuthEmulator(auth, 'http://localhost:9099')
    connectFirestoreEmulator(db, 'localhost', 8080)
  }
} catch (error) {
  console.error('Firebase initialization error:', error)
  // Create placeholder objects to prevent crashes
  app = {} as FirebaseApp
  auth = {} as Auth
  db = {} as Firestore
}

export { auth, db }

// Email domain for synthetic email conversion
export const SYNTHETIC_EMAIL_DOMAIN = 'group-trip.internal'

/**
 * Converts a username to a synthetic email for Firebase Auth
 * e.g., "john_doe" -> "john_doe@group-trip.internal"
 */
export function usernameToEmail(username: string): string {
  const sanitized = username.toLowerCase().replace(/\s+/g, '_')
  return `${sanitized}@${SYNTHETIC_EMAIL_DOMAIN}`
}
