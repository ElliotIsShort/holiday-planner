import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  useVillas,
  useAllVotes,
  useUsers,
  addVilla,
  deleteVilla,
  submitVote,
} from '../hooks/useFirestore'
import { VoteType, VOTE_WEIGHTS, MAX_BUDGET_PER_PERSON } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import './VillasPage.css'

interface VillaFormData {
  title: string
  sourceUrl: string
  imageUrl: string
  totalPriceGBP: string
  bedrooms: string
  bathrooms: string
  location: string
  notes: string
}

const initialFormData: VillaFormData = {
  title: '',
  sourceUrl: '',
  imageUrl: '',
  totalPriceGBP: '',
  bedrooms: '',
  bathrooms: '',
  location: '',
  notes: '',
}

function VillasPage() {
  const { user, isAdmin } = useAuth()
  const { data: villas, loading: villasLoading } = useVillas()
  const { data: votes } = useAllVotes()
  const { data: users } = useUsers()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<VillaFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const groupSize = users.length || 17

  if (villasLoading) {
    return <LoadingSpinner fullScreen />
  }

  // Get vote data for each villa
  const getVillaVoteData = (villaId: string) => {
    const villaVotes = votes.filter((v) => v.villaId === villaId)
    const score = villaVotes.reduce((sum, v) => sum + VOTE_WEIGHTS[v.voteType as VoteType], 0)
    const userVote = villaVotes.find((v) => v.userId === user?.uid)
    const loveCount = villaVotes.filter((v) => v.voteType === 'LOVE').length
    const fineCount = villaVotes.filter((v) => v.voteType === 'FINE').length
    const vetoCount = villaVotes.filter((v) => v.voteType === 'VETO').length

    return { score, userVote, loveCount, fineCount, vetoCount, totalVotes: villaVotes.length }
  }

  const handleVote = async (villaId: string, voteType: VoteType) => {
    if (!user) return

    await submitVote({
      villaId,
      userId: user.uid,
      userName: user.displayName,
      voteType,
    })
  }

  const handleAddVilla = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      await addVilla({
        title: formData.title,
        sourceUrl: formData.sourceUrl,
        imageUrl: formData.imageUrl,
        totalPriceGBP: parseInt(formData.totalPriceGBP) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        location: formData.location,
        notes: formData.notes,
        createdBy: user.uid,
      })
      setFormData(initialFormData)
      setShowModal(false)
    } catch (error) {
      console.error('Failed to add villa:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteVilla = async (villaId: string) => {
    if (confirm('Are you sure you want to delete this villa?')) {
      await deleteVilla(villaId)
    }
  }

  return (
    <div className="villas-page">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Villa Options</h1>
          <p>Vote on your favorite villas • Max budget: £{MAX_BUDGET_PER_PERSON}/person</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Villa
          </button>
        )}
      </div>

      {villas.length === 0 ? (
        <div className="empty-state">
          <h3>No villas yet</h3>
          <p>{isAdmin ? 'Add your first villa option to get started.' : 'The organizer hasn\'t added any villas yet.'}</p>
        </div>
      ) : (
        <div className="villas-grid">
          {villas.map((villa) => {
            const costPerPerson = Math.ceil(villa.totalPriceGBP / groupSize)
            const isUnderBudget = costPerPerson <= MAX_BUDGET_PER_PERSON
            const voteData = getVillaVoteData(villa.id)

            return (
              <div key={villa.id} className="villa-card">
                <div className="villa-image-container">
                  <img
                    src={villa.imageUrl || 'https://placehold.co/400x200/e2e8f0/64748b?text=No+Image'}
                    alt={villa.title}
                    className="villa-image"
                  />
                  <span className={`villa-badge ${isUnderBudget ? 'under-budget' : 'over-budget'}`}>
                    {isUnderBudget ? '✓ Under Budget' : '⚠ Over Budget'}
                  </span>
                </div>

                <div className="villa-content">
                  <h3>{villa.title}</h3>
                  <p className="location">{villa.location}</p>

                  <div className="villa-specs">
                    <span>🛏️ {villa.bedrooms} beds</span>
                    <span>🛁 {villa.bathrooms} baths</span>
                  </div>

                  <div className="villa-pricing">
                    <span className="total">Total: £{villa.totalPriceGBP.toLocaleString()}</span>
                    <span className="per-person">£{costPerPerson}/person</span>
                  </div>

                  {villa.notes && <p className="villa-notes">{villa.notes}</p>}

                  {villa.sourceUrl && (
                    <a href={villa.sourceUrl} target="_blank" rel="noopener noreferrer" className="villa-link">
                      View listing →
                    </a>
                  )}

                  <div className="voting-section">
                    <div className="vote-buttons">
                      <button
                        className={`vote-btn ${voteData.userVote?.voteType === 'LOVE' ? 'active love' : ''}`}
                        onClick={() => handleVote(villa.id, 'LOVE')}
                      >
                        <span className="emoji">❤️</span>
                        <span className="label">Love It</span>
                      </button>
                      <button
                        className={`vote-btn ${voteData.userVote?.voteType === 'FINE' ? 'active fine' : ''}`}
                        onClick={() => handleVote(villa.id, 'FINE')}
                      >
                        <span className="emoji">👍</span>
                        <span className="label">Can Live With It</span>
                      </button>
                      <button
                        className={`vote-btn ${voteData.userVote?.voteType === 'VETO' ? 'active veto' : ''}`}
                        onClick={() => handleVote(villa.id, 'VETO')}
                      >
                        <span className="emoji">🚫</span>
                        <span className="label">Veto</span>
                      </button>
                    </div>

                    <div className="vote-summary">
                      <span className="score">Score: {voteData.score}</span>
                      <span className="vote-count">{voteData.totalVotes} votes</span>
                    </div>
                    <div className="vote-breakdown">
                      <span>❤️ {voteData.loveCount}</span>
                      <span>👍 {voteData.fineCount}</span>
                      <span>🚫 {voteData.vetoCount}</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="admin-actions">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteVilla(villa.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Villa Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Villa</h2>
            </div>
            <form onSubmit={handleAddVilla}>
              <div className="modal-body">
                <div className="modal-form">
                  <div className="form-group">
                    <label htmlFor="title">Villa Name *</label>
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Costa Brava Cliffside Villa"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">Location *</label>
                    <input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Costa Brava, Spain"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="totalPriceGBP">Total Price (£) *</label>
                      <input
                        id="totalPriceGBP"
                        type="number"
                        value={formData.totalPriceGBP}
                        onChange={(e) => setFormData({ ...formData, totalPriceGBP: e.target.value })}
                        placeholder="4900"
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="bedrooms">Bedrooms *</label>
                      <input
                        id="bedrooms"
                        type="number"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                        placeholder="8"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="bathrooms">Bathrooms *</label>
                    <input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      placeholder="6"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="sourceUrl">Listing URL</label>
                    <input
                      id="sourceUrl"
                      type="url"
                      value={formData.sourceUrl}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                      placeholder="https://www.airbnb.com/rooms/..."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="imageUrl">Image URL</label>
                    <input
                      id="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes">Notes</label>
                    <input
                      id="notes"
                      type="text"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Includes private pool and sea view."
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Villa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default VillasPage
