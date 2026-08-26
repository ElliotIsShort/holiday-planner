import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'

// Custom render function that wraps components with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withRouter?: boolean
  withAuth?: boolean
}

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  )
}

function RouterOnly({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { withRouter = true, withAuth = true, ...renderOptions } = options

  let Wrapper: React.ComponentType<{ children: React.ReactNode }>

  if (withAuth && withRouter) {
    Wrapper = AllProviders
  } else if (withRouter) {
    Wrapper = RouterOnly
  } else {
    Wrapper = ({ children }) => <>{children}</>
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { renderWithProviders as render }
