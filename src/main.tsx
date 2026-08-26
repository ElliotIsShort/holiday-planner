import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import './styles/index.css'

// Debug logging
console.log('Main.tsx loaded')
console.log('BASE_URL:', import.meta.env.BASE_URL)

// GitHub Pages SPA redirect handling
// Restores the correct URL from the redirect in 404.html
(function() {
  const redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect && redirect !== location.href) {
    history.replaceState(null, '', redirect);
  }
})();

// Handle GitHub Pages path redirect
const l = window.location;
if (l.search[1] === '/') {
  const decoded = l.search.slice(1).split('&').map(s => s.replace(/~and~/g, '&')).join('?');
  window.history.replaceState(null, '', l.pathname.slice(0, -1) + decoded + l.hash);
}

// Get the base path for the router
const basename = import.meta.env.BASE_URL || '/';
console.log('Router basename:', basename)

// Error boundary for catching React errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h1>Something went wrong</h1>
          <pre>{this.state.error?.message}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

const rootElement = document.getElementById('root')
console.log('Root element:', rootElement)

if (rootElement) {
  try {
    console.log('Creating React root...')
    const root = ReactDOM.createRoot(rootElement)
    console.log('Rendering app...')
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <BrowserRouter basename={basename}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </React.StrictMode>,
    )
    console.log('Render called successfully')
  } catch (err) {
    console.error('Failed to render:', err)
    rootElement.innerHTML = `<div style="color: red; padding: 20px;"><h1>Failed to load app</h1><pre>${err}</pre></div>`
  }
} else {
  console.error('Root element not found!')
}
