import './LoadingSpinner.css'

interface LoadingSpinnerProps {
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
}

function LoadingSpinner({ fullScreen = false, size = 'md' }: LoadingSpinnerProps) {
  const spinner = <div className={`spinner spinner-${size}`} />

  if (fullScreen) {
    return (
      <div className="spinner-fullscreen">
        {spinner}
        <p className="spinner-text">Loading...</p>
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner
