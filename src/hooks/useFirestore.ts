import { useState, useEffect } from 'react'
import {
  collection,
  query,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore'
import { db, isDemoMode } from '../config/firebase'
import { Villa, VillaVote, Availability, Activity, User } from '../types'

// ============ DEMO DATA ============

const DEMO_USERS: User[] = [
  { uid: 'demo_user_1', username: 'demo_user', displayName: 'Demo User', role: 'admin', budgetCap: 350, preferences: [] },
  { uid: 'user_2', username: 'sarah_jones', displayName: 'Sarah Jones', role: 'user', budgetCap: 350, preferences: ['Private Pool'] },
  { uid: 'user_3', username: 'mike_wilson', displayName: 'Mike Wilson', role: 'user', budgetCap: 350, preferences: [] },
  { uid: 'user_4', username: 'emma_davis', displayName: 'Emma Davis', role: 'user', budgetCap: 350, preferences: ['Sea View'] },
  { uid: 'user_5', username: 'james_brown', displayName: 'James Brown', role: 'user', budgetCap: 350, preferences: [] },
]

const DEMO_VILLAS: Villa[] = [
  {
    id: 'villa_1',
    title: 'Costa Brava Cliffside Villa',
    sourceUrl: 'https://www.airbnb.com/rooms/example1',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    totalPriceGBP: 4900,
    bedrooms: 8,
    bathrooms: 6,
    location: 'Costa Brava',
    notes: 'Stunning views, private pool, 5 min walk to beach',
    createdBy: 'demo_user_1',
    createdAt: Timestamp.now(),
  },
  {
    id: 'villa_2',
    title: 'Ibiza Party Palace',
    sourceUrl: 'https://www.airbnb.com/rooms/example2',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    totalPriceGBP: 7200,
    bedrooms: 10,
    bathrooms: 8,
    location: 'Ibiza',
    notes: 'Infinity pool, DJ booth, close to clubs',
    createdBy: 'demo_user_1',
    createdAt: Timestamp.now(),
  },
  {
    id: 'villa_3',
    title: 'Malaga Mountain Retreat',
    sourceUrl: 'https://www.airbnb.com/rooms/example3',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    totalPriceGBP: 3800,
    bedrooms: 7,
    bathrooms: 5,
    location: 'Malaga',
    notes: 'Peaceful setting, vineyard nearby, BBQ area',
    createdBy: 'demo_user_1',
    createdAt: Timestamp.now(),
  },
]

const DEMO_VOTES: VillaVote[] = [
  { id: 'vote_1', villaId: 'villa_1', userId: 'user_2', userName: 'Sarah Jones', voteType: 'LOVE' },
  { id: 'vote_2', villaId: 'villa_1', userId: 'user_3', userName: 'Mike Wilson', voteType: 'FINE' },
  { id: 'vote_3', villaId: 'villa_2', userId: 'user_4', userName: 'Emma Davis', voteType: 'LOVE' },
  { id: 'vote_4', villaId: 'villa_3', userId: 'user_5', userName: 'James Brown', voteType: 'LOVE' },
  { id: 'vote_5', villaId: 'villa_2', userId: 'user_2', userName: 'Sarah Jones', voteType: 'VETO' },
]

const DEMO_AVAILABILITY: Availability[] = [
  { userId: 'user_2', userName: 'Sarah Jones', freeDates: ['2027-07-05', '2027-07-06', '2027-07-07', '2027-07-12', '2027-07-13'] },
  { userId: 'user_3', userName: 'Mike Wilson', freeDates: ['2027-07-05', '2027-07-06', '2027-07-19', '2027-07-20'] },
  { userId: 'user_4', userName: 'Emma Davis', freeDates: ['2027-07-05', '2027-08-01', '2027-08-02', '2027-08-03'] },
]

const DEMO_ACTIVITIES: Activity[] = [
  { id: 'act_1', title: 'Private Boat Charter', description: 'Half-day catamaran tour along the coast with lunch included', estimatedCostPerPerson: 85, proposedBy: 'user_2', proposedByName: 'Sarah Jones', upvotes: ['user_3', 'user_4'] },
  { id: 'act_2', title: 'Wine Tasting Tour', description: 'Visit local vineyards and sample regional wines', estimatedCostPerPerson: 45, proposedBy: 'user_3', proposedByName: 'Mike Wilson', upvotes: ['user_2', 'user_4', 'user_5'] },
  { id: 'act_3', title: 'Beach Volleyball Tournament', description: 'Set up a tournament on the beach - free!', estimatedCostPerPerson: 0, proposedBy: 'user_5', proposedByName: 'James Brown', upvotes: ['user_2'] },
]

// In-memory stores for demo mode
let demoVillas = [...DEMO_VILLAS]
let demoVotes = [...DEMO_VOTES]
let demoAvailability = [...DEMO_AVAILABILITY]
let demoActivities = [...DEMO_ACTIVITIES]

// Subscribers for demo mode reactivity
type Subscriber<T> = (data: T[]) => void
const subscribers: Record<string, Set<Subscriber<unknown>>> = {
  villas: new Set(),
  villaVotes: new Set(),
  availability: new Set(),
  activities: new Set(),
  users: new Set(),
}

function notifySubscribers(collectionName: string) {
  const data = getDemoData(collectionName)
  subscribers[collectionName]?.forEach(cb => cb(data))
}

function getDemoData(collectionName: string): unknown[] {
  switch (collectionName) {
    case 'villas': return demoVillas
    case 'villaVotes': return demoVotes
    case 'availability': return demoAvailability
    case 'activities': return demoActivities
    case 'users': return DEMO_USERS
    default: return []
  }
}

// ============ GENERIC HOOK ============

function useCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Demo mode: use in-memory data
    if (isDemoMode) {
      const initialData = getDemoData(collectionName) as T[]
      setData(initialData)
      setLoading(false)

      // Subscribe to changes
      const callback = (newData: unknown) => setData(newData as T[])
      subscribers[collectionName]?.add(callback as Subscriber<unknown>)

      return () => {
        subscribers[collectionName]?.delete(callback as Subscriber<unknown>)
      }
    }

    // Real Firebase mode
    try {
      const q = query(collection(db, collectionName), ...constraints)
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[]
          setData(items)
          setLoading(false)
        },
        (err) => {
          setError(err)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error('Firestore error:', err)
      setError(err as Error)
      setLoading(false)
    }
  }, [collectionName, JSON.stringify(constraints)])

  return { data, loading, error }
}

// ============ VILLAS ============

export function useVillas() {
  return useCollection<Villa>('villas', isDemoMode ? [] : [orderBy('createdAt', 'desc')])
}

export async function addVilla(
  villa: Omit<Villa, 'id' | 'createdAt'>
): Promise<string> {
  if (isDemoMode) {
    const id = `villa_${Date.now()}`
    const newVilla: Villa = { ...villa, id, createdAt: Timestamp.now() }
    demoVillas = [newVilla, ...demoVillas]
    notifySubscribers('villas')
    return id
  }

  const docRef = await addDoc(collection(db, 'villas'), {
    ...villa,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function updateVilla(
  id: string,
  updates: Partial<Villa>
): Promise<void> {
  if (isDemoMode) {
    demoVillas = demoVillas.map(v => v.id === id ? { ...v, ...updates } : v)
    notifySubscribers('villas')
    return
  }

  await updateDoc(doc(db, 'villas', id), updates)
}

export async function deleteVilla(id: string): Promise<void> {
  if (isDemoMode) {
    demoVillas = demoVillas.filter(v => v.id !== id)
    demoVotes = demoVotes.filter(v => v.villaId !== id)
    notifySubscribers('villas')
    notifySubscribers('villaVotes')
    return
  }

  await deleteDoc(doc(db, 'villas', id))
}

// ============ VILLA VOTES ============

export function useVillaVotes(villaId?: string) {
  const constraints: QueryConstraint[] = !isDemoMode && villaId
    ? [where('villaId', '==', villaId)]
    : []
  return useCollection<VillaVote>('villaVotes', constraints)
}

export function useAllVotes() {
  return useCollection<VillaVote>('villaVotes')
}

export async function submitVote(
  vote: Omit<VillaVote, 'id'>
): Promise<void> {
  const voteId = `${vote.villaId}_${vote.userId}`
  
  if (isDemoMode) {
    demoVotes = demoVotes.filter(v => v.id !== voteId)
    demoVotes.push({ ...vote, id: voteId })
    notifySubscribers('villaVotes')
    return
  }

  await setDoc(doc(db, 'villaVotes', voteId), {
    ...vote,
    id: voteId,
  })
}

export async function deleteVote(
  villaId: string,
  userId: string
): Promise<void> {
  const voteId = `${villaId}_${userId}`
  
  if (isDemoMode) {
    demoVotes = demoVotes.filter(v => v.id !== voteId)
    notifySubscribers('villaVotes')
    return
  }

  await deleteDoc(doc(db, 'villaVotes', voteId))
}

// ============ AVAILABILITY ============

export function useAvailability() {
  return useCollection<Availability>('availability')
}

export async function updateAvailability(
  userId: string,
  userName: string,
  freeDates: string[]
): Promise<void> {
  if (isDemoMode) {
    demoAvailability = demoAvailability.filter(a => a.userId !== userId)
    demoAvailability.push({ userId, userName, freeDates })
    notifySubscribers('availability')
    return
  }

  await setDoc(doc(db, 'availability', userId), {
    userId,
    userName,
    freeDates,
  })
}

// ============ ACTIVITIES ============

export function useActivities() {
  return useCollection<Activity>('activities')
}

export async function addActivity(
  activity: Omit<Activity, 'id' | 'upvotes'>
): Promise<string> {
  if (isDemoMode) {
    const id = `act_${Date.now()}`
    const newActivity: Activity = { ...activity, id, upvotes: [] }
    demoActivities = [...demoActivities, newActivity]
    notifySubscribers('activities')
    return id
  }

  const docRef = await addDoc(collection(db, 'activities'), {
    ...activity,
    upvotes: [],
  })
  return docRef.id
}

export async function toggleActivityUpvote(
  activityId: string,
  userId: string,
  currentUpvotes: string[]
): Promise<void> {
  const hasUpvoted = currentUpvotes.includes(userId)
  const newUpvotes = hasUpvoted
    ? currentUpvotes.filter((id) => id !== userId)
    : [...currentUpvotes, userId]

  if (isDemoMode) {
    demoActivities = demoActivities.map(a => 
      a.id === activityId ? { ...a, upvotes: newUpvotes } : a
    )
    notifySubscribers('activities')
    return
  }

  await updateDoc(doc(db, 'activities', activityId), {
    upvotes: newUpvotes,
  })
}

export async function deleteActivity(id: string): Promise<void> {
  if (isDemoMode) {
    demoActivities = demoActivities.filter(a => a.id !== id)
    notifySubscribers('activities')
    return
  }

  await deleteDoc(doc(db, 'activities', id))
}

// ============ USERS ============

export function useUsers() {
  return useCollection<User>('users')
}

export function useUserCount() {
  const { data: users, loading } = useUsers()
  return { count: users.length, loading }
}
