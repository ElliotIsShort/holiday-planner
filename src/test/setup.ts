import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Immediately call with null (not logged in)
    callback(null)
    return vi.fn() // unsubscribe function
  }),
  connectAuthEmulator: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn((query, callback) => {
    callback({ docs: [] })
    return vi.fn() // unsubscribe function
  }),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
  },
  connectFirestoreEmulator: vi.fn(),
}))

// Mock environment variables
vi.stubEnv('VITE_FIREBASE_API_KEY', '')
vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', '')
vi.stubEnv('VITE_FIREBASE_PROJECT_ID', '')
