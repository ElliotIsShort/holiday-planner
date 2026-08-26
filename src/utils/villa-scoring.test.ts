import { describe, it, expect } from 'vitest'
import {
  calculateVillaScore,
  countVotesByType,
  isVetoed,
  calculateCostPerPerson,
  isWithinBudget,
  sortVillasByScore,
} from './villa-scoring'
import { VillaVote } from '../types'

const createVote = (voteType: 'LOVE' | 'FINE' | 'VETO', userId: string = 'user1'): VillaVote => ({
  id: `vote_${userId}`,
  villaId: 'villa1',
  userId,
  userName: 'Test User',
  voteType,
})

describe('calculateVillaScore', () => {
  it('should return 0 for no votes', () => {
    expect(calculateVillaScore([])).toBe(0)
  })

  it('should calculate score for single LOVE vote', () => {
    const votes = [createVote('LOVE')]
    expect(calculateVillaScore(votes)).toBe(2)
  })

  it('should calculate score for single FINE vote', () => {
    const votes = [createVote('FINE')]
    expect(calculateVillaScore(votes)).toBe(1)
  })

  it('should calculate negative score for VETO', () => {
    const votes = [createVote('VETO')]
    expect(calculateVillaScore(votes)).toBe(-99)
  })

  it('should calculate mixed votes correctly', () => {
    const votes = [
      createVote('LOVE', 'user1'),
      createVote('LOVE', 'user2'),
      createVote('FINE', 'user3'),
    ]
    expect(calculateVillaScore(votes)).toBe(5) // 2 + 2 + 1
  })

  it('should handle VETO overwhelming positive votes', () => {
    const votes = [
      createVote('LOVE', 'user1'),
      createVote('LOVE', 'user2'),
      createVote('LOVE', 'user3'),
      createVote('VETO', 'user4'),
    ]
    expect(calculateVillaScore(votes)).toBe(-93) // 2 + 2 + 2 - 99
  })
})

describe('countVotesByType', () => {
  it('should return zeros for no votes', () => {
    const counts = countVotesByType([])
    expect(counts).toEqual({ LOVE: 0, FINE: 0, VETO: 0 })
  })

  it('should count votes correctly', () => {
    const votes = [
      createVote('LOVE', 'user1'),
      createVote('LOVE', 'user2'),
      createVote('FINE', 'user3'),
      createVote('VETO', 'user4'),
    ]
    const counts = countVotesByType(votes)
    expect(counts).toEqual({ LOVE: 2, FINE: 1, VETO: 1 })
  })
})

describe('isVetoed', () => {
  it('should return false for no votes', () => {
    expect(isVetoed([])).toBe(false)
  })

  it('should return false for only positive votes', () => {
    const votes = [createVote('LOVE'), createVote('FINE')]
    expect(isVetoed(votes)).toBe(false)
  })

  it('should return true if any vote is VETO', () => {
    const votes = [
      createVote('LOVE', 'user1'),
      createVote('VETO', 'user2'),
    ]
    expect(isVetoed(votes)).toBe(true)
  })
})

describe('calculateCostPerPerson', () => {
  it('should calculate cost correctly', () => {
    expect(calculateCostPerPerson(4900, 17)).toBe(289)
  })

  it('should round up to nearest pound', () => {
    expect(calculateCostPerPerson(5000, 17)).toBe(295) // 294.11... rounds up
  })

  it('should return 0 for invalid group size', () => {
    expect(calculateCostPerPerson(5000, 0)).toBe(0)
    expect(calculateCostPerPerson(5000, -1)).toBe(0)
  })

  it('should handle exact division', () => {
    expect(calculateCostPerPerson(3400, 17)).toBe(200)
  })
})

describe('isWithinBudget', () => {
  it('should return true for villa under budget', () => {
    expect(isWithinBudget(4900, 17)).toBe(true) // £289/person
  })

  it('should return true for villa exactly at budget', () => {
    expect(isWithinBudget(5950, 17)).toBe(true) // £350/person
  })

  it('should return false for villa over budget', () => {
    expect(isWithinBudget(7000, 17)).toBe(false) // £412/person
  })

  it('should consider group size in calculation', () => {
    // Same price, different group sizes
    expect(isWithinBudget(5600, 20)).toBe(true) // £280/person
    expect(isWithinBudget(5600, 14)).toBe(false) // £400/person
  })
})

describe('sortVillasByScore', () => {
  const villas = [
    { id: 'villa1', title: 'Villa 1' },
    { id: 'villa2', title: 'Villa 2' },
    { id: 'villa3', title: 'Villa 3' },
  ]

  it('should sort by score descending', () => {
    const votesByVilla: Record<string, VillaVote[]> = {
      villa1: [createVote('FINE', 'user1')], // Score: 1
      villa2: [createVote('LOVE', 'user1')], // Score: 2
      villa3: [], // Score: 0
    }

    const sorted = sortVillasByScore(villas, votesByVilla)
    expect(sorted.map((v) => v.id)).toEqual(['villa2', 'villa1', 'villa3'])
  })

  it('should exclude vetoed villas when flag is set', () => {
    const votesByVilla: Record<string, VillaVote[]> = {
      villa1: [createVote('LOVE', 'user1')],
      villa2: [createVote('VETO', 'user1')],
      villa3: [createVote('FINE', 'user1')],
    }

    const sorted = sortVillasByScore(villas, votesByVilla, true)
    expect(sorted.map((v) => v.id)).toEqual(['villa1', 'villa3'])
    expect(sorted.find((v) => v.id === 'villa2')).toBeUndefined()
  })

  it('should include vetoed villas when flag is false', () => {
    const votesByVilla: Record<string, VillaVote[]> = {
      villa1: [createVote('LOVE', 'user1')],
      villa2: [createVote('VETO', 'user1')],
      villa3: [createVote('FINE', 'user1')],
    }

    const sorted = sortVillasByScore(villas, votesByVilla, false)
    expect(sorted.length).toBe(3)
  })
})
