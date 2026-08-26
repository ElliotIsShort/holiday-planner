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
import VillaImportModal from '../components/VillaImportModal'
import './VillasPage.css'

function VillasPage() {
  const { user, isAdmin } = useAuth()
  const { data: villas, loading: villasLoading } = useVillas()
  const { data: votes } = useAllVotes()
  const { data: users } = useUsers()
  const [showImportModal, setShowImportModal] = useState(false)
  const [expandedVilla, setExpandedVilla] = useState<string | null>(null)

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

  const handleImport = async (data: {
    title: string
    sourceUrl: string
    location: string
    totalPriceGBP: string
    bedrooms: string
    bathrooms: string
    images: string[]
    amenities: string[]
    notes: string
  }) => {
    if (!user) return

    try {
      await addVilla({
        title: data.title,
        sourceUrl: data.sourceUrl,
        imageUrl: data.images[0] || '',
        images: data.images,
        totalPriceGBP: parseInt(data.totalPriceGBP) || 0,
        bedrooms: parseInt(data.bedrooms) || 0,
        bathrooms: parseInt(data.bathrooms) || 0,
        location: data.location,
        notes: data.notes,
        amenities: data.amenities,
        createdBy: user.uid,
      })
      setShowImportModal(false)
    } catch (error) {
      console.error('Failed to add villa:', error)
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
          <button className="btn btn-primary" onClick={() => setShowImportModal(true)}>
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
            const isExpanded = expandedVilla === villa.id
            const displayImage = villa.imageUrl || villa.images?.[0] || 'https://placehold.co/400x200/e2e8f0/64748b?text=No+Image'

            return (
              <div key={villa.id} className={`villa-card ${isExpanded ? 'expanded' : ''}`}>
                <div className="villa-image-container">
                  <img
                    src={displayImage}
                    alt={villa.title}
                    className="villa-image"
                  />
                  <span className={`villa-badge ${isUnderBudget ? 'under-budget' : 'over-budget'}`}>
                    {isUnderBudget ? '✓ Under Budget' : '⚠ Over Budget'}
                  </span>
                  {villa.images && villa.images.length > 1 && (
                    <span className="photo-count">📷 {villa.images.length}</span>
                  )}
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

                  {/* Amenities */}
                  {villa.amenities && villa.amenities.length > 0 && (
                    <div className="villa-amenities">
                      {villa.amenities.slice(0, isExpanded ? undefined : 4).map((amenity) => (
                        <span key={amenity} className="amenity-tag">{amenity}</span>
                      ))}
                      {!isExpanded && villa.amenities.length > 4 && (
                        <button 
                          className="amenity-tag more"
                          onClick={() => setExpandedVilla(villa.id)}
                        >
                          +{villa.amenities.length - 4} more
                        </button>
                      )}
                    </div>
                  )}

                  {villa.notes && <p className="villa-notes">{villa.notes}</p>}

                  {villa.sourceUrl && (
                    <a href={villa.sourceUrl} target="_blank" rel="noopener noreferrer" className="villa-link">
                      View listing →
                    </a>
                  )}

                  {/* Expanded Image Gallery */}
                  {isExpanded && villa.images && villa.images.length > 1 && (
                    <div className="image-gallery">
                      {villa.images.map((img, idx) => (
                        <img 
                          key={idx} 
                          src={img} 
                          alt={`${villa.title} photo ${idx + 1}`}
                          className="gallery-image"
                        />
                      ))}
                    </div>
                  )}

                  {isExpanded && (
                    <button 
                      className="btn btn-secondary btn-sm collapse-btn"
                      onClick={() => setExpandedVilla(null)}
                    >
                      Show Less
                    </button>
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

      {/* Import Modal */}
      {showImportModal && (
        <VillaImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}
    </div>
  )
}

export default VillasPage
