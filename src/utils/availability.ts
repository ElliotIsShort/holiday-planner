import { Availability } from '../types'

/**
 * Calculate availability counts per date
 */
export function getDateAvailabilityCounts(
  availabilityData: Availability[]
): Record<string, number> {
  const counts: Record<string, number> = {}

  availabilityData.forEach((a) => {
    a.freeDates.forEach((date) => {
      counts[date] = (counts[date] || 0) + 1
    })
  })

  return counts
}

/**
 * Get the best dates (most people available)
 */
export function getBestDates(
  availabilityData: Availability[],
  limit: number = 5
): Array<{ date: string; count: number }> {
  const counts = getDateAvailabilityCounts(availabilityData)

  return Object.entries(counts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * Get users available on a specific date
 */
export function getUsersAvailableOnDate(
  availabilityData: Availability[],
  date: string
): string[] {
  return availabilityData
    .filter((a) => a.freeDates.includes(date))
    .map((a) => a.userName)
}

/**
 * Calculate availability percentage for a date
 */
export function getAvailabilityPercentage(
  availableCount: number,
  totalUsers: number
): number {
  if (totalUsers === 0) return 0
  return Math.round((availableCount / totalUsers) * 100)
}

/**
 * Get heat level (0-5) for availability visualization
 */
export function getHeatLevel(availableCount: number, totalUsers: number): number {
  if (availableCount === 0) return 0
  const percentage = availableCount / totalUsers
  if (percentage >= 0.8) return 5
  if (percentage >= 0.6) return 4
  if (percentage >= 0.4) return 3
  if (percentage >= 0.2) return 2
  return 1
}
