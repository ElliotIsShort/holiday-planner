import { describe, it, expect } from 'vitest'
import {
  getDateAvailabilityCounts,
  getBestDates,
  getUsersAvailableOnDate,
  getAvailabilityPercentage,
  getHeatLevel,
} from './availability'
import { Availability } from '../types'

const sampleAvailability: Availability[] = [
  { userId: 'user1', userName: 'Alice', freeDates: ['2027-07-05', '2027-07-06', '2027-07-07'] },
  { userId: 'user2', userName: 'Bob', freeDates: ['2027-07-05', '2027-07-06'] },
  { userId: 'user3', userName: 'Charlie', freeDates: ['2027-07-05', '2027-07-08'] },
]

describe('getDateAvailabilityCounts', () => {
  it('should return empty object for no availability', () => {
    expect(getDateAvailabilityCounts([])).toEqual({})
  })

  it('should count availability correctly', () => {
    const counts = getDateAvailabilityCounts(sampleAvailability)
    expect(counts['2027-07-05']).toBe(3) // All three
    expect(counts['2027-07-06']).toBe(2) // Alice and Bob
    expect(counts['2027-07-07']).toBe(1) // Alice only
    expect(counts['2027-07-08']).toBe(1) // Charlie only
  })
})

describe('getBestDates', () => {
  it('should return empty array for no availability', () => {
    expect(getBestDates([])).toEqual([])
  })

  it('should return dates sorted by count descending', () => {
    const best = getBestDates(sampleAvailability)
    expect(best[0]).toEqual({ date: '2027-07-05', count: 3 })
    expect(best[1]).toEqual({ date: '2027-07-06', count: 2 })
  })

  it('should respect limit parameter', () => {
    const best = getBestDates(sampleAvailability, 2)
    expect(best.length).toBe(2)
  })

  it('should default to 5 results', () => {
    const best = getBestDates(sampleAvailability)
    expect(best.length).toBeLessThanOrEqual(5)
  })
})

describe('getUsersAvailableOnDate', () => {
  it('should return empty array for date with no availability', () => {
    const users = getUsersAvailableOnDate(sampleAvailability, '2027-07-01')
    expect(users).toEqual([])
  })

  it('should return all users available on a date', () => {
    const users = getUsersAvailableOnDate(sampleAvailability, '2027-07-05')
    expect(users).toHaveLength(3)
    expect(users).toContain('Alice')
    expect(users).toContain('Bob')
    expect(users).toContain('Charlie')
  })

  it('should return subset of users for partial availability', () => {
    const users = getUsersAvailableOnDate(sampleAvailability, '2027-07-07')
    expect(users).toEqual(['Alice'])
  })
})

describe('getAvailabilityPercentage', () => {
  it('should return 0 for no users', () => {
    expect(getAvailabilityPercentage(0, 0)).toBe(0)
  })

  it('should calculate percentage correctly', () => {
    expect(getAvailabilityPercentage(5, 10)).toBe(50)
    expect(getAvailabilityPercentage(3, 17)).toBe(18) // 17.6% rounds to 18
    expect(getAvailabilityPercentage(17, 17)).toBe(100)
  })

  it('should round to nearest integer', () => {
    expect(getAvailabilityPercentage(1, 3)).toBe(33) // 33.33%
    expect(getAvailabilityPercentage(2, 3)).toBe(67) // 66.67%
  })
})

describe('getHeatLevel', () => {
  it('should return 0 for no availability', () => {
    expect(getHeatLevel(0, 10)).toBe(0)
  })

  it('should return 1 for very low availability (<20%)', () => {
    expect(getHeatLevel(1, 10)).toBe(1) // 10%
  })

  it('should return 2 for low availability (20%)', () => {
    expect(getHeatLevel(2, 10)).toBe(2) // 20%
  })

  it('should return 3 for medium-low availability (30-40%)', () => {
    expect(getHeatLevel(3, 10)).toBe(2) // 30%
    expect(getHeatLevel(4, 10)).toBe(3) // 40%
  })

  it('should return 3-4 for medium availability (50-60%)', () => {
    expect(getHeatLevel(5, 10)).toBe(3) // 50%
    expect(getHeatLevel(6, 10)).toBe(4) // 60%
  })

  it('should return 4 for high availability (70%)', () => {
    expect(getHeatLevel(7, 10)).toBe(4) // 70%
  })

  it('should return 5 for very high availability (80%+)', () => {
    expect(getHeatLevel(8, 10)).toBe(5) // 80%
    expect(getHeatLevel(9, 10)).toBe(5) // 90%
    expect(getHeatLevel(10, 10)).toBe(5) // 100%
  })
})
