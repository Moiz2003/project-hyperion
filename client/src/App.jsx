import { lazy, Suspense, useRef } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import ErrorBoundary from './components/ErrorBoundary'
import PageTransition from './components/layout/PageTransition'
import { PageSkeleton } from './components/ui/Skeleton'
import { ToastProvider } from './components/ui/Toast'

// Lazy-loaded pages for code splitting
const SplashScreen = lazy(() => import('./SplashScreen'))
const LandingPage = lazy(() => import('./LandingPage'))
const PricingPage = lazy(() => import('./PricingPage'))
const DocumentPage = lazy(() => import('./DocumentPage'))
const ContactPage = lazy(() => import('./ContactPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const ProductPage = lazy(() => import('./ProductPage'))
const SolutionsPage = lazy(() => import('./SolutionsPage'))

const DOC_VIEWS = new Set(['feature-tour', 'documentation', 'api-reference', 'privacy', 'terms', 'hipaa'])

function viewToPath(view) {
  const [baseView, queryStr] = view.split('?')
  const query = queryStr ? `?${queryStr}` : ''

  if (baseView === 'landing') return '/'
  if (baseView === 'dashboard') return `/dashboard${query}`
  if (baseView === 'login') return `/login${query}`
  if (baseView === 'signup') return `/signup${query}`
  if (baseView === 'pricing') return `/pricing${query}`
  if (baseView === 'contact') return `/contact${query}`
  if (baseView === 'product') return `/product${query}`
  if (baseView === 'solutions') return `/solutions${query}`
  if (DOC_VIEWS.has(baseView)) return `/docs/${baseView}${query}`
  return '/'
}

function useViewNavigate() {
  const routerNavigate = useNavigate()
  return (view) => routerNavigate(viewToPath(view))
}

function SuspenseWrapper({ children }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
}

function RootRoute() {
  const onNavigate = useViewNavigate()
  const hasSeen = sessionStorage.getItem('hasSeenSplash')

  if (!hasSeen) {
    return (
      <SuspenseWrapper>
        <SplashScreen
          onComplete={() => {
            sessionStorage.setItem('hasSeenSplash', 'true')
            onNavigate('landing')
          }}
        />
      </SuspenseWrapper>
    )
  }
  return (
    <PageTransition keyProp="landing">
      <SuspenseWrapper>
        <LandingPage onNavigate={onNavigate} />
      </SuspenseWrapper>
    </PageTransition>
  )
}

function PricingRoute() {
  const onNavigate = useViewNavigate()
  return (
    <PageTransition keyProp="pricing">
      <SuspenseWrapper>
        <PricingPage onNavigate={onNavigate} />
      </SuspenseWrapper>
    </PageTransition>
  )
}

function ContactRoute() {
  const onNavigate = useViewNavigate()
  return (
    <PageTransition keyProp="contact">
      <SuspenseWrapper>
        <ContactPage onNavigate={onNavigate} />
      </SuspenseWrapper>
    </PageTransition>
  )
}

function ProductRoute() {
  const onNavigate = useViewNavigate()
  return (
    <PageTransition keyProp="product">
      <SuspenseWrapper>
        <ProductPage onNavigate={onNavigate} />
      </SuspenseWrapper>
    </PageTransition>
  )
}

function SolutionsRoute() {
  const onNavigate = useViewNavigate()
  return (
    <PageTransition keyProp="solutions">
      <SuspenseWrapper>
        <SolutionsPage onNavigate={onNavigate} />
      </SuspenseWrapper>
    </PageTransition>
  )
}

function LoginRoute() {
  const onNavigate = useViewNavigate()
  return (
    <PageTransition keyProp="login">
      <SuspenseWrapper>
        <LoginPage onNavigate={onNavigate} />
      </SuspenseWrapper>
    </PageTransition>
  )
}

function SignupRoute() {
  const onNavigate = useViewNavigate()
  return (
    <PageTransition keyProp="signup">
      <SuspenseWrapper>
        <SignupPage onNavigate={onNavigate} />
      </SuspenseWrapper>
    </PageTransition>
  )
}

function DocRoute() {
  const onNavigate = useViewNavigate()
  const { type } = useParams()
  if (!DOC_VIEWS.has(type)) return <Navigate to="/" replace />
  return (
    <PageTransition keyProp={type}>
      <SuspenseWrapper>
        <DocumentPage type={type} onNavigate={onNavigate} />
      </SuspenseWrapper>
    </PageTransition>
  )
}

function DashboardRoute() {
  return (
    <PageTransition keyProp="dashboard">
      <SuspenseWrapper>
        <Dashboard />
      </SuspenseWrapper>
    </PageTransition>
  )
}

function AnalyticsRoute() {
  return (
    <PageTransition keyProp="analytics">
      <SuspenseWrapper>
        <AnalyticsPage />
      </SuspenseWrapper>
    </PageTransition>
  )
}

function AppRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="popLayout">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RootRoute />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route path="/analytics" element={<AnalyticsRoute />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/signup" element={<SignupRoute />} />
        <Route path="/pricing" element={<PricingRoute />} />
        <Route path="/contact" element={<ContactRoute />} />
        <Route path="/product" element={<ProductRoute />} />
        <Route path="/solutions" element={<SolutionsRoute />} />
        <Route path="/docs/:type" element={<DocRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const mainRef = useRef(null)

  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          {/* Skip-to-content link for keyboard users */}
          <a
            href="#main-content"
            className="skip-to-content"
            onClick={(e) => {
              e.preventDefault()
              mainRef.current?.focus()
            }}
          >
            Skip to content
          </a>
          <main id="main-content" ref={mainRef} tabIndex={-1}>
            <AppRoutes />
          </main>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  )
}
