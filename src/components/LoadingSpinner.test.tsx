import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('should render spinner element', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('.spinner')).toBeInTheDocument()
  })

  it('should render medium size by default', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('.spinner-md')).toBeInTheDocument()
  })

  it('should render small size when specified', () => {
    const { container } = render(<LoadingSpinner size="sm" />)
    expect(container.querySelector('.spinner-sm')).toBeInTheDocument()
  })

  it('should render large size when specified', () => {
    const { container } = render(<LoadingSpinner size="lg" />)
    expect(container.querySelector('.spinner-lg')).toBeInTheDocument()
  })

  it('should render fullscreen version with loading text', () => {
    render(<LoadingSpinner fullScreen />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should have fullscreen container class when fullScreen is true', () => {
    const { container } = render(<LoadingSpinner fullScreen />)
    expect(container.querySelector('.spinner-fullscreen')).toBeInTheDocument()
  })
})
