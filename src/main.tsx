import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import './index.css'

// Lazy load App to enable route-level code splitting at the app level
const App = lazy(() => import('./App.tsx'))

/* ─────────────────────── Loading Fallback ─────────────────────── */

function LoadingFallback() {
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center"
      style={{ backgroundColor: '#000814' }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Spinner */}
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-transparent"
          style={{
            borderTopColor: '#0077B6',
            borderRightColor: 'rgba(0, 119, 182, 0.3)',
          }}
          role="status"
          aria-label="Loading"
        />
        <p
          className="text-sm tracking-wide"
          style={{ color: '#C8D3D9', fontFamily: 'Inter, sans-serif' }}
        >
          Loading CarZee...
        </p>
      </div>
    </div>
  )
}

/* ─────────────────────── Error Boundary Fallback ─────────────────────── */

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CarZee Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-[100dvh] items-center justify-center px-6"
          style={{ backgroundColor: '#000814' }}
        >
          <div
            className="flex max-w-md flex-col items-center gap-6 rounded-2xl border p-8 text-center"
            style={{
              backgroundColor: 'rgba(0, 18, 51, 0.6)',
              borderColor: 'rgba(255, 77, 109, 0.3)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(255, 77, 109, 0.15)' }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FF4D6D"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <h1
                className="text-xl font-semibold"
                style={{
                  color: '#FFFFFF',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                Something went wrong
              </h1>
              <p
                className="text-sm leading-relaxed"
                style={{ color: '#C8D3D9', fontFamily: 'Inter, sans-serif' }}
              >
                We apologize for the inconvenience. Please refresh the page or try again later.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-[1.03]"
              style={{
                backgroundColor: '#0077B6',
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Need to import React for the class component above
import React from 'react'

/* ─────────────────────── Render ─────────────────────── */

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <HashRouter>
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </HashRouter>
  </ErrorBoundary>,
)
