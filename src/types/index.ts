import { Timestamp } from 'firebase/firestore'

export type UserRole = 'admin' | 'user'

export interface User {
  uid: string
  username: string
  displayName: string
  role: UserRole
  budgetCap: number
  preferences: string[]
}

export interface Villa {
  id: string
  title: string
  sourceUrl: string
  imageUrl: string
  totalPriceGBP: number
  bedrooms: number
  bathrooms: number
  location: string
  notes: string
  createdBy: string
  createdAt: Timestamp
}

export type VoteType = 'LOVE' | 'FINE' | 'VETO'

export interface VillaVote {
  id: string
  villaId: string
  userId: string
  userName: string
  voteType: VoteType
}

export interface Availability {
  userId: string
  userName: string
  freeDates: string[] // ISO date strings like "2027-07-03"
}

export interface Activity {
  id: string
  title: string
  description: string
  estimatedCostPerPerson: number
  proposedBy: string
  proposedByName: string
  upvotes: string[] // Array of user IDs
}

// Vote weights for scoring
export const VOTE_WEIGHTS: Record<VoteType, number> = {
  LOVE: 2,
  FINE: 1,
  VETO: -99,
}

// Budget threshold per person
export const MAX_BUDGET_PER_PERSON = 350

// Group size range
export const GROUP_SIZE = {
  MIN: 14,
  MAX: 20,
  DEFAULT: 17, // Middle estimate for calculations
}
