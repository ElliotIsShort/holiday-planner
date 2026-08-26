import { useState } from 'react'
import './VillaImportModal.css'

interface VillaImportData {
  title: string
  sourceUrl: string
  location: string
  totalPriceGBP: string
  bedrooms: string
  bathrooms: string
  images: string[]
  amenities: string[]
  notes: string
}

interface Props {
  onClose: () => void
  onImport: (data: VillaImportData) => void
}

const COMMON_AMENITIES = [
  'Private Pool',
  'Hot Tub',
  'Sea View',
  'Mountain View',
  'Garden',
  'BBQ',
  'Air Conditioning',
  'Wifi',
  'Parking',
  'Beach Access',
  'Gym',
  'Games Room',
  'Home Cinema',
  'Tennis Court',
  'Ensuite Bathrooms',
  'Kitchen',
  'Washing Machine',
  'Dishwasher',
]

function VillaImportModal({ onClose, onImport }: Props) {
  const [step, setStep] = useState(1)
  const [sourceUrl, setSourceUrl] = useState('')
  const [platform, setPlatform] = useState<'airbnb' | 'booking' | 'other'>('airbnb')
  const [formData, setFormData] = useState<VillaImportData>({
    title: '',
    sourceUrl: '',
    location: '',
    totalPriceGBP: '',
    bedrooms: '',
    bathrooms: '',
    images: [''],
    amenities: [],
    notes: '',
  })

  const detectPlatform = (url: string) => {
    if (url.includes('airbnb')) return 'airbnb'
    if (url.includes('booking.com')) return 'booking'
    return 'other'
  }

  const handleUrlSubmit = () => {
    const detected = detectPlatform(sourceUrl)
    setPlatform(detected)
    setFormData(prev => ({ ...prev, sourceUrl }))
    setStep(2)
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }))
  }

  const updateImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = () => {
    onImport({
      ...formData,
      images: formData.images.filter(url => url.trim() !== '')
    })
  }

  const isValid = formData.title && formData.totalPriceGBP && formData.bedrooms && formData.bathrooms

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content import-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {step === 1 && '🔗 Import Villa from URL'}
            {step === 2 && '📋 Enter Villa Details'}
            {step === 3 && '🏷️ Amenities & Photos'}
          </h2>
          <div className="step-indicator">Step {step} of 3</div>
        </div>

        <div className="modal-body">
          {/* Step 1: URL Input */}
          {step === 1 && (
            <div className="import-step">
              <p className="step-description">
                Paste the Airbnb or Booking.com URL for the villa you want to add.
                We'll guide you through copying the key details.
              </p>
              
              <div className="form-group">
                <label htmlFor="sourceUrl">Listing URL</label>
                <input
                  id="sourceUrl"
                  type="url"
                  value={sourceUrl}
                  onChange={e => setSourceUrl(e.target.value)}
                  placeholder="https://www.airbnb.co.uk/rooms/..."
                />
              </div>

              <div className="platform-hint">
                <span className="supported">✓ Airbnb</span>
                <span className="supported">✓ Booking.com</span>
                <span className="supported">✓ Other URLs</span>
              </div>
            </div>
          )}

          {/* Step 2: Basic Details */}
          {step === 2 && (
            <div className="import-step">
              <div className="copy-instructions">
                <h4>📖 Quick Copy Guide for {platform === 'airbnb' ? 'Airbnb' : platform === 'booking' ? 'Booking.com' : 'your listing'}:</h4>
                {platform === 'airbnb' && (
                  <ul>
                    <li><strong>Title:</strong> Copy the main heading (e.g., "Entire villa in Costa Brava")</li>
                    <li><strong>Location:</strong> Below the title or in the map section</li>
                    <li><strong>Price:</strong> Look for "Total before taxes" for your dates</li>
                    <li><strong>Beds/Baths:</strong> Listed near the top with guests capacity</li>
                  </ul>
                )}
                {platform === 'booking' && (
                  <ul>
                    <li><strong>Title:</strong> The hotel/villa name at the top</li>
                    <li><strong>Location:</strong> Address shown below the title</li>
                    <li><strong>Price:</strong> Total price shown in the booking summary</li>
                    <li><strong>Beds/Baths:</strong> In the room/property details section</li>
                  </ul>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="title">Villa Name / Title *</label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Stunning Cliffside Villa with Pool"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="location">Location *</label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Costa Brava, Spain"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="totalPrice">Total Price (£) *</label>
                  <input
                    id="totalPrice"
                    type="number"
                    value={formData.totalPriceGBP}
                    onChange={e => setFormData(prev => ({ ...prev, totalPriceGBP: e.target.value }))}
                    placeholder="4900"
                  />
                  <span className="field-hint">Total for the whole stay</span>
                </div>

                <div className="form-group">
                  <label htmlFor="bedrooms">Bedrooms *</label>
                  <input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={e => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                    placeholder="8"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bathrooms">Bathrooms *</label>
                  <input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={e => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                    placeholder="6"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="e.g., 5 min walk to beach, includes daily cleaning..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Amenities & Photos */}
          {step === 3 && (
            <div className="import-step">
              <div className="amenities-section">
                <h4>Select Amenities</h4>
                <p className="step-description">Click all that apply from the listing</p>
                <div className="amenities-grid">
                  {COMMON_AMENITIES.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      className={`amenity-chip ${formData.amenities.includes(amenity) ? 'selected' : ''}`}
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="photos-section">
                <h4>Photo URLs (Optional)</h4>
                <p className="step-description">
                  Right-click images on the listing → "Copy image address"
                </p>
                {formData.images.map((url, index) => (
                  <div key={index} className="image-input-row">
                    <input
                      type="url"
                      value={url}
                      onChange={e => updateImage(index, e.target.value)}
                      placeholder="https://..."
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeImage(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {formData.images.length < 5 && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={addImageField}
                  >
                    + Add Another Image
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step > 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(s => s - 1)}
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          
          {step === 1 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUrlSubmit}
              disabled={!sourceUrl}
            >
              Continue →
            </button>
          )}
          
          {step === 2 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep(3)}
              disabled={!isValid}
            >
              Continue →
            </button>
          )}
          
          {step === 3 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              ✓ Add Villa
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default VillaImportModal
