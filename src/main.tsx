import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import './styles/index.css'

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
