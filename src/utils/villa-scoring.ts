import { VillaVote, VoteType, VOTE_WEIGHTS, MAX_BUDGET_PER_PERSON } from '../types'

/**
 * Calculate the total score for a villa based on votes
 */
export function calculateVillaScore(votes: VillaVote[]): number {
  return votes.reduce((sum, vote) => sum + VOTE_WEIGHTS[vote.voteType], 0)
}

/**
 * Count votes by type for a villa
 */
export function countVotesByType(votes: VillaVote[]): Record<VoteType, number> {
  return {
    LOVE: votes.filter((v) => v.voteType === 'LOVE').length,
    FINE: votes.filter((v) => v.voteType === 'FINE').length,
    VETO: votes.filter((v) => v.voteType === 'VETO').length,
  }
}

/**
 * Check if a villa has been vetoed
 */
export function isVetoed(votes: VillaVote[]): boolean {
  return votes.some((v) => v.voteType === 'VETO')
}

/**
 * Calculate cost per person for a villa
 */
export function calculateCostPerPerson(totalPrice: number, groupSize: number): number {
  if (groupSize <= 0) return 0
  return Math.ceil(totalPrice / groupSize)
}

/**
 * Check if a villa is within budget
 */
export function isWithinBudget(totalPrice: number, groupSize: number): boolean {
  const costPerPerson = calculateCostPerPerson(totalPrice, groupSize)
  return costPerPerson <= MAX_BUDGET_PER_PERSON
}

/**
 * Sort villas by score (highest first), filtering out vetoed ones optionally
 */
export function sortVillasByScore<T extends { id: string }>(
  villas: T[],
  votesByVilla: Record<string, VillaVote[]>,
  excludeVetoed: boolean = false
): T[] {
  return [...villas]
    .filter((villa) => {
      if (!excludeVetoed) return true
      const votes = votesByVilla[villa.id] || []
      return !isVetoed(votes)
    })
    .sort((a, b) => {
      const scoreA = calculateVillaScore(votesByVilla[a.id] || [])
      const scoreB = calculateVillaScore(votesByVilla[b.id] || [])
      return scoreB - scoreA
    })
}
