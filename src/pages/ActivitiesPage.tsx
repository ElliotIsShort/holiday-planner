import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  useActivities,
  useUsers,
  addActivity,
  deleteActivity,
  toggleActivityUpvote,
} from '../hooks/useFirestore'
import LoadingSpinner from '../components/LoadingSpinner'
import './ActivitiesPage.css'

interface ActivityFormData {
  title: string
  description: string
  estimatedCostPerPerson: string
}

const initialFormData: ActivityFormData = {
  title: '',
  description: '',
  estimatedCostPerPerson: '',
}

function ActivitiesPage() {
  const { user, isAdmin } = useAuth()
  const { data: activities, loading: activitiesLoading } = useActivities()
  const { data: users } = useUsers()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<ActivityFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (activitiesLoading) {
    return <LoadingSpinner fullScreen />
  }

  // Get user name by ID
  const getUserName = (userId: string) => {
    const found = users.find((u) => u.uid === userId)
    return found?.displayName || 'Unknown'
  }

  // Handle adding an activity
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      await addActivity({
        title: formData.title,
        description: formData.description,
        estimatedCostPerPerson: parseFloat(formData.estimatedCostPerPerson) || 0,
        proposedBy: user.uid,
        proposedByName: user.displayName,
      })
      setFormData(initialFormData)
      setShowModal(false)
    } catch (error) {
      console.error('Failed to add activity:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle upvote toggle
  const handleToggleUpvote = async (activityId: string, currentUpvotes: string[]) => {
    if (!user) return
    await toggleActivityUpvote(activityId, user.uid, currentUpvotes)
  }

  // Handle delete
  const handleDeleteActivity = async (activityId: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      await deleteActivity(activityId)
    }
  }

  // Sort activities by upvote count
  const sortedActivities = [...activities].sort(
    (a, b) => b.upvotes.length - a.upvotes.length
  )

  return (
    <div className="activities-page">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Activity Ideas</h1>
          <p>Propose activities and see what everyone's interested in</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Propose Activity
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="empty-state">
          <h3>No activities yet</h3>
          <p>Be the first to propose something fun for the group!</p>
        </div>
      ) : (
        <div className="activities-grid">
          {sortedActivities.map((activity) => {
            const hasUpvoted = user && activity.upvotes.includes(user.uid)
            const canDelete = user && (activity.proposedBy === user.uid || isAdmin)
            const interestedNames = activity.upvotes
              .map((uid) => getUserName(uid))
              .join(', ')

            return (
              <div key={activity.id} className="activity-card">
                <div className="activity-header">
                  <h3>{activity.title}</h3>
                  {activity.estimatedCostPerPerson > 0 && (
                    <span className="activity-cost">
                      ~£{activity.estimatedCostPerPerson}/person
                    </span>
                  )}
                </div>

                <p className="activity-description">{activity.description}</p>

                <p className="activity-meta">
                  Proposed by {activity.proposedByName}
                </p>

                <div className="activity-footer">
                  <div className="activity-actions">
                    <button
                      className={`upvote-btn ${hasUpvoted ? 'upvoted' : ''}`}
                      onClick={() => handleToggleUpvote(activity.id, activity.upvotes)}
                    >
                      <span>🙋</span>
                      <span>{hasUpvoted ? "I'm In!" : "Count Me In"}</span>
                    </button>
                    {canDelete && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteActivity(activity.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <div className="interested-users">
                    <span className="interest-count">
                      {activity.upvotes.length} interested
                    </span>
                    {activity.upvotes.length > 0 && (
                      <span className="names" title={interestedNames}>
                        ({interestedNames})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Activity Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Propose an Activity</h2>
            </div>
            <form onSubmit={handleAddActivity}>
              <div className="modal-body">
                <div className="modal-form">
                  <div className="form-group">
                    <label htmlFor="title">Activity Name *</label>
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Private Boat Charter"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Describe the activity..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cost">Estimated Cost per Person (£)</label>
                    <input
                      id="cost"
                      type="number"
                      value={formData.estimatedCostPerPerson}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedCostPerPerson: e.target.value,
                        })
                      }
                      placeholder="45"
                      min="0"
                      step="1"
                    />
                    <span className="cost-hint">Leave empty if unsure</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Propose Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivitiesPage
