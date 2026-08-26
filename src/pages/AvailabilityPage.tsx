import { useState, useMemo, useCallback } from 'react'
import {
  eachDayOfInterval,
  format,
  startOfMonth,
  endOfMonth,
  getDay,
  isWeekend,
  addMonths,
} from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { useAvailability, useUsers, updateAvailability } from '../hooks/useFirestore'
import LoadingSpinner from '../components/LoadingSpinner'
import './AvailabilityPage.css'

// Date range: June - September 2027
const START_DATE = new Date(2027, 5, 1) // June 1, 2027

// Generate months array
const MONTHS = [0, 1, 2, 3].map((offset) => addMonths(START_DATE, offset))

function AvailabilityPage() {
  const { user } = useAuth()
  const { data: availability, loading: availabilityLoading } = useAvailability()
  const { data: users, loading: usersLoading } = useUsers()
  const [isSaving, setIsSaving] = useState(false)

  // Get current user's availability
  const userAvailability = useMemo(() => {
    const found = availability.find((a) => a.userId === user?.uid)
    return found?.freeDates || []
  }, [availability, user?.uid])

  const [selectedDates, setSelectedDates] = useState<string[]>(userAvailability)

  // Sync selectedDates when userAvailability changes from Firestore
  useMemo(() => {
    setSelectedDates(userAvailability)
  }, [userAvailability])

  // Calculate availability count for each date
  const dateAvailabilityMap = useMemo(() => {
    const map: Record<string, string[]> = {}

    availability.forEach((a) => {
      a.freeDates.forEach((date) => {
        if (!map[date]) map[date] = []
        map[date].push(a.userName)
      })
    })

    return map
  }, [availability])

  const totalUsers = users.length

  // Toggle date selection
  const toggleDate = useCallback((dateStr: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    )
  }, [])

  // Save availability
  const saveAvailability = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      await updateAvailability(user.uid, user.displayName, selectedDates)
    } catch (error) {
      console.error('Failed to save availability:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    const sortedSelected = [...selectedDates].sort()
    const sortedUser = [...userAvailability].sort()
    return JSON.stringify(sortedSelected) !== JSON.stringify(sortedUser)
  }, [selectedDates, userAvailability])

  // Get heat color based on availability percentage
  const getHeatColor = (count: number) => {
    if (count === 0) return 'heat-0'
    const percentage = count / totalUsers
    if (percentage >= 0.8) return 'heat-5'
    if (percentage >= 0.6) return 'heat-4'
    if (percentage >= 0.4) return 'heat-3'
    if (percentage >= 0.2) return 'heat-2'
    return 'heat-1'
  }

  // Render a single month
  const renderMonth = (monthDate: Date) => {
    const start = startOfMonth(monthDate)
    const end = endOfMonth(monthDate)
    const days = eachDayOfInterval({ start, end })
    const firstDayOffset = getDay(start) // 0 = Sunday

    return (
      <div key={monthDate.toISOString()} className="calendar-month">
        <h3 className="month-title">{format(monthDate, 'MMMM yyyy')}</h3>
        <div className="calendar-grid">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="calendar-header">
              {day}
            </div>
          ))}

          {/* Empty cells for offset */}
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="calendar-cell empty" />
          ))}

          {/* Day cells */}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const isSelected = selectedDates.includes(dateStr)
            const availableUsers = dateAvailabilityMap[dateStr] || []
            const availableCount = availableUsers.length
            const heatClass = getHeatColor(availableCount)
            const isWeekendDay = isWeekend(day)

            return (
              <button
                key={dateStr}
                className={`calendar-cell ${heatClass} ${isSelected ? 'selected' : ''} ${isWeekendDay ? 'weekend' : ''}`}
                onClick={() => toggleDate(dateStr)}
                title={
                  availableCount > 0
                    ? `${availableCount} available: ${availableUsers.join(', ')}`
                    : 'No one available yet'
                }
              >
                <span className="day-number">{format(day, 'd')}</span>
                {availableCount > 0 && (
                  <span className="day-count">{availableCount}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (availabilityLoading || usersLoading) {
    return <LoadingSpinner fullScreen />
  }

  // Find best dates (highest availability)
  const sortedDates = Object.entries(dateAvailabilityMap)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)

  return (
    <div className="availability-page">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Availability</h1>
          <p>Select the dates you're free in Summer 2027</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={saveAvailability}
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? 'Saving...' : 'Save My Availability'}
        </button>
      </div>

      <div className="availability-layout">
        <div className="calendar-section">
          <div className="instructions">
            <p>
              <strong>Click dates</strong> to mark when you're free. Colors show group availability:
            </p>
            <div className="legend">
              <span className="legend-item">
                <span className="legend-swatch heat-0"></span> 0
              </span>
              <span className="legend-item">
                <span className="legend-swatch heat-1"></span> 1-20%
              </span>
              <span className="legend-item">
                <span className="legend-swatch heat-2"></span> 20-40%
              </span>
              <span className="legend-item">
                <span className="legend-swatch heat-3"></span> 40-60%
              </span>
              <span className="legend-item">
                <span className="legend-swatch heat-4"></span> 60-80%
              </span>
              <span className="legend-item">
                <span className="legend-swatch heat-5"></span> 80%+
              </span>
            </div>
          </div>

          <div className="calendars-grid">
            {MONTHS.map((month) => renderMonth(month))}
          </div>
        </div>

        <aside className="availability-sidebar">
          <div className="sidebar-card">
            <h3>📊 Best Dates So Far</h3>
            {sortedDates.length > 0 ? (
              <ul className="best-dates-list">
                {sortedDates.map(([date, users]) => (
                  <li key={date}>
                    <span className="date">
                      {format(new Date(date), 'EEE, MMM d')}
                    </span>
                    <span className="count">{users.length} / {totalUsers}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">No availability submitted yet</p>
            )}
          </div>

          <div className="sidebar-card">
            <h3>👥 Who's Submitted</h3>
            <ul className="submitted-list">
              {users.map((u) => {
                const hasSubmitted = availability.some((a) => a.userId === u.uid)
                return (
                  <li key={u.uid} className={hasSubmitted ? 'submitted' : 'pending'}>
                    <span className="name">{u.displayName}</span>
                    <span className="status">{hasSubmitted ? '✓' : '—'}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="sidebar-card">
            <h3>📅 Your Selections</h3>
            <p className="selection-count">
              <strong>{selectedDates.length}</strong> days selected
            </p>
            {hasChanges && (
              <p className="unsaved-warning">You have unsaved changes</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default AvailabilityPage
