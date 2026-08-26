import { useVillas, useAllVotes, useAvailability, useActivities, useUsers } from '../hooks/useFirestore'
import { VOTE_WEIGHTS, MAX_BUDGET_PER_PERSON, VoteType } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import './DashboardPage.css'

function DashboardPage() {
  const { data: villas, loading: villasLoading } = useVillas()
  const { data: votes } = useAllVotes()
  const { data: availability } = useAvailability()
  const { data: activities } = useActivities()
  const { data: users, loading: usersLoading } = useUsers()

  if (villasLoading || usersLoading) {
    return <LoadingSpinner fullScreen />
  }

  const groupSize = users.length || 17

  // Calculate top villa by score
  const villaScores = villas.map((villa) => {
    const villaVotes = votes.filter((v) => v.villaId === villa.id)
    const score = villaVotes.reduce((sum, v) => sum + VOTE_WEIGHTS[v.voteType as VoteType], 0)
    const vetoCount = villaVotes.filter((v) => v.voteType === 'VETO').length
    const costPerPerson = Math.ceil(villa.totalPriceGBP / groupSize)
    return { villa, score, vetoCount, costPerPerson, voteCount: villaVotes.length }
  })

  const topVilla = villaScores
    .filter((v) => v.vetoCount === 0)
    .sort((a, b) => b.score - a.score)[0]

  // Calculate best dates from availability
  const dateCounts: Record<string, number> = {}
  availability.forEach((a) => {
    a.freeDates.forEach((date) => {
      dateCounts[date] = (dateCounts[date] || 0) + 1
    })
  })

  const sortedDates = Object.entries(dateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Top activities
  const topActivities = [...activities]
    .sort((a, b) => b.upvotes.length - a.upvotes.length)
    .slice(0, 3)

  // Stats
  const totalVotes = votes.length
  const availabilitySubmissions = availability.length

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of the trip planning progress</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Group Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{villas.length}</div>
          <div className="stat-label">Villas Listed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalVotes}</div>
          <div className="stat-label">Votes Cast</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{availabilitySubmissions}</div>
          <div className="stat-label">Availability Submitted</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>🏆 Leading Villa</h2>
          {topVilla ? (
            <div className="top-villa">
              <img
                src={topVilla.villa.imageUrl || 'https://placehold.co/400x200/e2e8f0/64748b?text=No+Image'}
                alt={topVilla.villa.title}
                className="top-villa-image"
              />
              <h3>{topVilla.villa.title}</h3>
              <p className="villa-location">{topVilla.villa.location}</p>
              <div className="villa-stats">
                <span className="score">Score: {topVilla.score}</span>
                <span className={`cost ${topVilla.costPerPerson <= MAX_BUDGET_PER_PERSON ? 'under-budget' : 'over-budget'}`}>
                  £{topVilla.costPerPerson}/person
                </span>
              </div>
            </div>
          ) : (
            <p className="empty-state">No villas without vetos yet</p>
          )}
        </div>

        <div className="dashboard-card">
          <h2>📅 Best Dates</h2>
          {sortedDates.length > 0 ? (
            <ul className="date-list">
              {sortedDates.map(([date, count]) => (
                <li key={date}>
                  <span className="date">{new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <span className="count">{count} / {users.length} free</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No availability submitted yet</p>
          )}
        </div>

        <div className="dashboard-card">
          <h2>🎉 Popular Activities</h2>
          {topActivities.length > 0 ? (
            <ul className="activity-list">
              {topActivities.map((activity) => (
                <li key={activity.id}>
                  <span className="activity-title">{activity.title}</span>
                  <span className="activity-votes">{activity.upvotes.length} interested</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No activities proposed yet</p>
          )}
        </div>

        <div className="dashboard-card budget-info">
          <h2>💰 Budget Info</h2>
          <div className="budget-details">
            <div className="budget-item">
              <span className="label">Max per person</span>
              <span className="value">£{MAX_BUDGET_PER_PERSON}</span>
            </div>
            <div className="budget-item">
              <span className="label">Group size</span>
              <span className="value">{groupSize} people</span>
            </div>
            <div className="budget-item">
              <span className="label">Max total budget</span>
              <span className="value">£{MAX_BUDGET_PER_PERSON * groupSize}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
