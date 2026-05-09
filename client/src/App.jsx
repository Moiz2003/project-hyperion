import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import LandingPage from './LandingPage'
import SplashScreen from './SplashScreen'
import PricingPage from './PricingPage'
import DocumentPage from './DocumentPage'
import ContactPage from './ContactPage'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import Dashboard from './pages/Dashboard'
import AnalyticsPage from './pages/AnalyticsPage'
import ErrorBoundary from './components/ErrorBoundary'
import ProductPage from './ProductPage'
import SolutionsPage from './SolutionsPage'

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 40, filter: 'blur(15px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -40, filter: 'blur(15px)' },
  transition: { duration: 0.8, ease: 'easeOut' },
}

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

function PageWrapper({ children, keyProp }) {
  return (
    <motion.div key={keyProp} {...PAGE_TRANSITION} className="absolute inset-0 w-full min-h-screen bg-[#020617] z-40">
      {children}
    </motion.div>
  )
}

function RootRoute() {
  const onNavigate = useViewNavigate()
  const hasSeen = sessionStorage.getItem('hasSeenSplash')

  if (!hasSeen) {
    return (
      <SplashScreen
        onComplete={() => {
          sessionStorage.setItem('hasSeenSplash', 'true')
          onNavigate('landing')
        }}
      />
    )
  }
  return (
    <PageWrapper keyProp="landing">
      <LandingPage onNavigate={onNavigate} />
    </PageWrapper>
  )
}

function PricingRoute() {
  const onNavigate = useViewNavigate()
  return <PageWrapper keyProp="pricing"><PricingPage onNavigate={onNavigate} /></PageWrapper>
}

function ContactRoute() {
  const onNavigate = useViewNavigate()
  return <PageWrapper keyProp="contact"><ContactPage onNavigate={onNavigate} /></PageWrapper>
}

function ProductRoute() {
  const onNavigate = useViewNavigate()
  return <PageWrapper keyProp="product"><ProductPage onNavigate={onNavigate} /></PageWrapper>
}

function SolutionsRoute() {
  const onNavigate = useViewNavigate()
  return <PageWrapper keyProp="solutions"><SolutionsPage onNavigate={onNavigate} /></PageWrapper>
}

function LoginRoute() {
  const onNavigate = useViewNavigate()
  return <PageWrapper keyProp="login"><LoginPage onNavigate={onNavigate} /></PageWrapper>
}

function SignupRoute() {
  const onNavigate = useViewNavigate()
  return <PageWrapper keyProp="signup"><SignupPage onNavigate={onNavigate} /></PageWrapper>
}

function DocRoute() {
  const onNavigate = useViewNavigate()
  const { type } = useParams()
  if (!DOC_VIEWS.has(type)) return <Navigate to="/" replace />
  return <PageWrapper keyProp={type}><DocumentPage type={type} onNavigate={onNavigate} /></PageWrapper>
}

function DashboardRoute() {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 40, filter: 'blur(15px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <Dashboard />
    </motion.div>
  )
}

function AnalyticsRoute() {
  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0, y: 40, filter: 'blur(15px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <AnalyticsPage />
    </motion.div>
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
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
