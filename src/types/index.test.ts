import { describe, it, expect } from 'vitest'
import { VOTE_WEIGHTS, MAX_BUDGET_PER_PERSON, GROUP_SIZE } from './index'

describe('Vote Weights', () => {
  it('should have correct weight for LOVE vote', () => {
    expect(VOTE_WEIGHTS.LOVE).toBe(2)
  })

  it('should have correct weight for FINE vote', () => {
    expect(VOTE_WEIGHTS.FINE).toBe(1)
  })

  it('should have correct weight for VETO vote', () => {
    expect(VOTE_WEIGHTS.VETO).toBe(-99)
  })

  it('VETO should significantly impact score', () => {
    // A single VETO should make score very negative
    const fiveLoves = 5 * VOTE_WEIGHTS.LOVE
    const oneVeto = VOTE_WEIGHTS.VETO
    expect(fiveLoves + oneVeto).toBeLessThan(0)
  })
})

describe('Budget Constants', () => {
  it('should have max budget per person of £350', () => {
    expect(MAX_BUDGET_PER_PERSON).toBe(350)
  })

  it('should have valid group size range', () => {
    expect(GROUP_SIZE.MIN).toBe(14)
    expect(GROUP_SIZE.MAX).toBe(20)
    expect(GROUP_SIZE.DEFAULT).toBe(17)
  })

  it('default group size should be within range', () => {
    expect(GROUP_SIZE.DEFAULT).toBeGreaterThanOrEqual(GROUP_SIZE.MIN)
    expect(GROUP_SIZE.DEFAULT).toBeLessThanOrEqual(GROUP_SIZE.MAX)
  })
})

describe('Budget Calculations', () => {
  it('should calculate max total budget correctly', () => {
    const maxTotal = MAX_BUDGET_PER_PERSON * GROUP_SIZE.DEFAULT
    expect(maxTotal).toBe(5950) // £350 * 17 people
  })

  it('should calculate cost per person correctly', () => {
    const villaPrice = 4900
    const groupSize = 17
    const costPerPerson = Math.ceil(villaPrice / groupSize)
    expect(costPerPerson).toBe(289) // Under budget
  })

  it('should identify over-budget villas', () => {
    const expensiveVilla = 8000
    const smallGroup = 14
    const costPerPerson = Math.ceil(expensiveVilla / smallGroup)
    expect(costPerPerson).toBeGreaterThan(MAX_BUDGET_PER_PERSON)
  })
})
