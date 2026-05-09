# Frontend Winning Strategy — Project Hyperion

> **Mission**: Transform the Hyperion frontend from a functional dashboard into a production-grade, hackathon-winning immersive experience that showcases the 3-Agent Adversarial Swarm's capabilities with cinematic flair, micro-interactions, and data visualization that judges will remember.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Design System & Visual Identity](#2-design-system--visual-identity)
3. [Animation Strategy](#3-animation-strategy)
4. [Page Transitions & Routing](#4-page-transitions--routing)
5. [Micro-Interactions](#5-micro-interactions)
6. [Data Visualization](#6-data-visualization)
7. [Education Mode Integration](#7-education-mode-integration)
8. [Responsive Design](#8-responsive-design)
9. [Accessibility](#9-accessibility)
10. [Performance Optimization](#10-performance-optimization)
11. [Implementation Plan](#11-implementation-plan)
12. [File Manifest](#12-file-manifest)

---

## 1. Architecture Overview

### Current Stack
- **Framework**: React 19 + Vite 8
- **Routing**: React Router v7
- **Animation**: Framer Motion 12
- **Styling**: Tailwind CSS v4
- **Icons**: lucide-react
- **PDF**: jspdf

### Target Architecture

```
client/src/
├── App.jsx                          # Root with ErrorBoundary + BrowserRouter
├── main.jsx                         # Entry point
├── index.css                        # Tailwind v4 theme + global styles
├── vite.config.js                   # Build config
│
├── components/                      # Shared UI components
│   ├── ui/                          # Atomic design system
│   │   ├── Button.jsx               # CTA button with ripple + glow
│   │   ├── Card.jsx                 # Glassmorphic card with hover lift
│   │   ├── Badge.jsx                # Status badge with pulse
│   │   ├── Input.jsx                # Themed input with focus ring
│   │   ├── Modal.jsx                # Animated modal with backdrop blur
│   │   ├── Toast.jsx                # Toast notification system
│   │   ├── Skeleton.jsx             # Skeleton loading states
│   │   ├── Tooltip.jsx              # Hover tooltip with delay
│   │   ├── ProgressBar.jsx          # Animated progress bar
│   │   └── index.js                 # Barrel export
│   │
│   ├── layout/
│   │   ├── Header.jsx               # Sticky nav with scroll-aware glass
│   │   ├── Footer.jsx               # Footer with animated links
│   │   ├── PageTransition.jsx       # Shared page transition wrapper
│   │   └── Container.jsx            # Max-width container
│   │
│   ├── effects/
│   │   ├── ParticleField.jsx        # Canvas-based particle system
│   │   ├── GridOverlay.jsx          # Subtle grid background
│   │   ├── ScanLine.jsx             # CRT scanline overlay
│   │   ├── GlitchText.jsx           # Reusable glitch text component
│   │   ├── GradientOrb.jsx          # Floating gradient orbs
│   │   └── CursorGlow.jsx           # Mouse-following glow
│   │
│   ├── dashboard/
│   │   ├── UploadZone.jsx           # Drag-and-drop with preview
│   │   ├── ResultsPanel.jsx         # Verified report with discovery mode
│   │   ├── SwarmVisualizer.jsx      # Agent consensus visualization
│   │   ├── SwarmStatus.jsx          # Health polling indicator
│   │   ├── BatchPanel.jsx           # Multi-image batch analysis
│   │   ├── LoadingOverlay.jsx       # Neural consensus loading
│   │   ├── HUDIcons.jsx             # SVG icon set
│   │   └── EngineModeSelector.jsx   # Mode toggle with tooltips
│   │
│   └── charts/
│       ├── Sparkline.jsx            # Inline SVG sparkline
│       ├── UrgencyBar.jsx           # Animated urgency distribution
│       ├── DepartmentChart.jsx      # Department distribution
│       └── ConfidenceGauge.jsx      # Arc gauge for confidence
│
├── pages/
│   ├── LandingPage.jsx              # Hero + features + dual-market
│   ├── Dashboard.jsx                # Main HUD with all sub-panels
│   ├── AnalyticsPage.jsx            # Swarm performance analytics
│   ├── LoginPage.jsx                # Auth placeholder
│   ├── SignupPage.jsx               # Auth placeholder
│   ├── PricingPage.jsx              # Pricing tiers
│   ├── ContactPage.jsx              # Contact form
│   ├── ProductPage.jsx              # Product marketing
│   ├── SolutionsPage.jsx            # Solutions grid
│   └── DocumentPage.jsx             # Documentation viewer
│
├── hooks/
│   ├── useSSE.js                    # SSE stream hook with buffer mgmt
│   ├── useScrollProgress.js         # Scroll-driven animations
│   ├── useMediaQuery.js             # Responsive breakpoints
│   ├── useMousePosition.js          # Mouse tracking for effects
│   ├── useIntersectionObserver.js   # Lazy loading / viewport detection
│   └── useLocalStorage.js           # Persistent state
│
├── context/
│   ├── ThemeContext.jsx              # Dark/light (future)
│   └── ScanContext.jsx              # Global scan state
│
├── data/
│   └── demoScan.js                  # Frozen demo data
│
├── utils/
│   ├── cn.js                        # clsx + tailwind-merge helper
│   ├── formatters.js                # Date, number, latency formatters
│   └── constants.js                 # API_BASE, colors, breakpoints
│
└── assets/                          # Static images
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State Management | React Context + hooks | App is not complex enough for Redux/Zustand; context avoids prop drilling for scan state |
| Animation Engine | Framer Motion | Already in deps; `AnimatePresence` for route transitions, `useScroll` for scroll-driven |
| CSS Approach | Tailwind v4 + CSS custom properties | Already in deps; `@theme` directive for design tokens |
| Route Transitions | `AnimatePresence` with `mode="popLayout"` | Smooth layout-aware transitions between pages |
| Particle Effects | Canvas 2D (no lib) | Lighter than Three.js/particles.js; custom ~50-line implementation |
| Code Splitting | React.lazy + Suspense | Per-route lazy loading for all page components |

---

## 2. Design System & Visual Identity

### Color Palette (Already Defined in `index.css`)

```
Primary:   cyan-400 (#22d3ee)    → Accents, glows, active states
Secondary: blue-500 (#3b82f6)    → Gradients, section dividers
Surface:   slate-950 (#020617)   → Page background
Card:      slate-900/30          → Glassmorphic cards
Success:   emerald-400           → Positive states
Warning:   amber-400             → Medium urgency
Danger:    red-400               → High urgency, errors
Text:      white → slate-300     → Hierarchy
```

### Typography

- **Primary**: Inter (400, 600, 700) — already imported via `@fontsource/inter`
- **Monospace**: system monospace for code/data — already used in `font-mono`
- **Scale**: `text-[10px]` for labels → `text-sm` for body → `text-5xl` for hero

### Visual Effects Stack (Layered)

```
Layer 0:  Background gradient (slate-950 → blue-950 → slate-950)
Layer 1:  Subtle grid overlay (opacity 3%, 40px grid)
Layer 2:  Floating gradient orbs (cyan/blue, blur-3xl, parallax)
Layer 3:  Particle field (canvas, 80 particles, mouse-responsive)
Layer 4:  Page content (z-10)
Layer 5:  Scanline overlay (optional, toggleable)
```

### Glassmorphism Formula

```css
.glass-card {
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(34, 211, 238, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

---

## 3. Animation Strategy

### 3.1 Scroll-Driven Animations (`LandingPage.jsx`)

| Element | Trigger | Animation | Duration |
|---------|---------|-----------|----------|
| Hero title | Page load | `opacity 0→1, y 40→0` | 1s easeOut |
| Feature cards | `whileInView` (once) | Staggered `y 20→0, opacity 0→1` | 0.5s each, 0.08s delay |
| Dual-market sections | `whileInView` | `x -40→0` (left) / `x 40→0` (right) | 0.8s easeOut |
| Stats counter | `whileInView` | Animated count-up | 2s per number |
| MRI blur effect | `useScroll` | `blur(20px)→0→blur(20px)` based on scroll | Continuous |
| Gradient orbs | `useScroll` | Parallax `y` transform | Continuous |

### 3.2 Page Transitions (`App.jsx`)

```javascript
// Enhanced PAGE_TRANSITION
const PAGE_TRANSITION = {
  initial: { 
    opacity: 0, 
    y: 60, 
    scale: 0.98,
    filter: 'blur(20px)' 
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    filter: 'blur(0px)' 
  },
  exit: { 
    opacity: 0, 
    y: -60, 
    scale: 1.02,
    filter: 'blur(20px)' 
  },
  transition: { 
    duration: 0.6, 
    ease: [0.22, 1, 0.36, 1]  // Custom cubic-bezier (ease-out-expo)
  },
}
```

### 3.3 Hover States

| Component | Effect | Details |
|-----------|--------|---------|
| Buttons (primary) | Scale 1.02 + glow expansion | `shadow-[0_0_30px_rgba(0,217,255,0.3)]` |
| Buttons (secondary) | Border color shift + bg fill | `hover:bg-slate-800 hover:border-cyan-400/50` |
| Cards | Lift `y -4px` + border glow | `hover:-translate-y-1 hover:shadow-xl` |
| Nav links | Underline slide-in | `::after` pseudo-element with `scaleX(0)→1` |
| Logo | Subtle pulse on hover | `scale(1.02)` with glow |

### 3.4 Loading States

| State | Component | Animation |
|-------|-----------|-----------|
| Page load | Skeleton cards | `animate-pulse` with staggered appearance |
| Scan analysis | LoadingOverlay | Triple-ring spinner + status text cycling |
| Data fetch | SkeletonSection | Pulsing blocks matching content shape |
| Image upload | UploadZone | Border pulse + progress ring |

---

## 4. Page Transitions & Routing

### Current (`App.jsx`)

- `AnimatePresence mode="popLayout"` — good foundation
- `PAGE_TRANSITION` with opacity/y/blur — decent but basic
- Dashboard and Analytics have separate `motion.div` wrappers

### Enhancements

1. **Unified `PageTransition` component** that wraps all routes:
   ```jsx
   function PageTransition({ children, keyProp }) {
     return (
       <motion.div
         key={keyProp}
         initial={{ opacity: 0, y: 60, scale: 0.98, filter: 'blur(20px)' }}
         animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
         exit={{ opacity: 0, y: -60, scale: 1.02, filter: 'blur(20px)' }}
         transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
         className="absolute inset-0 w-full min-h-screen bg-[#020617] z-40"
       >
         {children}
       </motion.div>
     )
   }
   ```

2. **Route-based code splitting** with `React.lazy`:
   ```jsx
   const Dashboard = React.lazy(() => import('./pages/Dashboard'))
   const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'))
   // ... wrap in <Suspense fallback={<PageSkeleton />}>
   ```

3. **View transitions API** (future, when browser support matures):
   - `document.startViewTransition()` for native-like transitions

---

## 5. Micro-Interactions

### 5.1 Button Ripple Effect

```jsx
function Button({ children, variant = 'primary', ...props }) {
  const [ripples, setRipples] = useState([])
  
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    setRipples(prev => [...prev, { x, y, id }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600)
  }
  
  return (
    <button onClick={handleClick} className="relative overflow-hidden">
      {children}
      {ripples.map(r => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/20 animate-[ripple_0.6s_ease-out]"
          style={{ left: r.x, top: r.y, width: 5, height: 5 }}
        />
      ))}
    </button>
  )
}
```

### 5.2 Input Focus Effects

- Glow border on focus: `focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400`
- Label float animation: label slides up when input has value or is focused
- Character count with color transition (green → yellow → red)

### 5.3 Card Hover Lift

```css
.card-hover {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(34, 211, 238, 0.15);
}
```

### 5.4 Status Indicator Pulse

- Agent status dots: `animate-pulse` when active, solid when done
- Connection indicator: green pulse when healthy, red flash on error
- Toast notifications: slide-up entrance, fade-out exit after 3s

### 5.5 Scroll-Aware Header

```jsx
const { scrollY } = useScroll()
const headerBg = useTransform(
  scrollY,
  [0, 100],
  ['rgba(2,6,23,0)', 'rgba(2,6,23,0.95)']
)
const headerBlur = useTransform(
  scrollY,
  [0, 100],
  ['blur(0px)', 'blur(20px)']
)
```

---

## 6. Data Visualization

### 6.1 AnalyticsPage Enhancements

| Current | Enhanced |
|---------|----------|
| Basic StatCard with number | StatCard with animated count-up + icon |
| Simple UrgencyBar | Animated bar with gradient fill + glow |
| Basic Sparkline SVG | Sparkline with gradient area fill + tooltip on hover |
| Plain department list | Horizontal bar chart with animated widths |
| No confidence visualization | Arc gauge showing confidence percentage |

### 6.2 Confidence Gauge Component

```jsx
function ConfidenceGauge({ value, size = 120 }) {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle r={radius} cx={size/2} cy={size/2} 
        fill="none" stroke="rgba(34,211,238,0.1)" strokeWidth="8" />
      <motion.circle r={radius} cx={size/2} cy={size/2}
        fill="none" stroke="url(#gaugeGradient)" strokeWidth="8"
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
    </svg>
  )
}
```

### 6.3 SwarmVisualizer Enhancements

| Current | Enhanced |
|---------|----------|
| Text-based agent rows | Animated node graph with connection lines |
| Static status dots | Pulsing nodes with data flow animations |
| Simple confidence text | Animated confidence gauge |
| No timing visualization | Per-agent timeline bar |

### 6.4 Real-Time SSE Event Visualization

- Agent nodes connected by animated SVG paths
- Data "packets" (small circles) traveling along paths during processing
- Color-coded: cyan for active, green for done, red for failed, amber for retry
- Latency counter with animated number transitions

---

## 7. Education Mode Integration

### Current State (Gap Analysis)

| Component | Status | Issue |
|-----------|--------|-------|
| Backend `resolveMode()` | ✅ Complete | Returns `'edu'` when `?mode=edu` in query |
| Backend `runPipeline()` edu path | ✅ Complete | Vision → Socratic only, skips Drafter/Critic |
| Backend `revealAnalysis()` | ✅ Complete | Full pipeline on cached image + diagnosis_match |
| Backend `eduSessionCache` | ✅ Complete | 30-min TTL, stores image + findings + hints |
| Backend `socraticCriticAgent` | ✅ Complete | Generates hint questions via Critic vLLM |
| Backend `diagnosisMatch` | ✅ Complete | Keyword scoring algorithm |
| Frontend `Dashboard.jsx` engineMode | ❌ Missing | No `'edu'` mode in state or UI |
| Frontend `ResultsPanel.jsx` | ⚠️ Partial | Uses `engineMode === 'discovery'` (should be `'edu'`) |
| Frontend `requestHint()` | ❌ Stub | Uses `setTimeout` instead of API call |
| Frontend `onReveal()` | ❌ Stub | Just sets `isRevealed(true)` instead of calling `/reveal` |

### Implementation Plan

#### 7.1 Add Education Mode Button to Dashboard

In [`Dashboard.jsx`](client/src/pages/Dashboard.jsx:376), add a 4th mode button:

```jsx
<button
  onClick={() => setEngineMode('edu')}
  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-inter font-semibold tracking-widest uppercase transition-all duration-300 ${
    engineMode === 'edu' 
      ? 'bg-indigo-900/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
      : 'text-slate-500 hover:text-white border border-transparent'
  }`}
>
  <HUDIcons.GraduationCap /> Education
</button>
```

#### 7.2 Wire `analyzeScan()` to Pass `mode=edu`

In [`Dashboard.jsx`](client/src/pages/Dashboard.jsx:206), modify the fetch URL:

```jsx
const modeParam = engineMode === 'edu' ? '&mode=edu' : ''
const response = await fetch(
  `${API_BASE}/api/analyze-scan/stream?demo=${isDemoMode}${modeParam}`,
  { method: 'POST', body: formData, signal: controller.signal }
)
```

#### 7.3 Wire `requestHint()` to API

Replace the `setTimeout` stub in [`Dashboard.jsx`](client/src/pages/Dashboard.jsx:334):

```jsx
const requestHint = useCallback(async () => {
  if (!results?._imageHash) return
  setIsHintLoading(true)
  try {
    const resp = await fetch(`${API_BASE}/api/analyze-scan/hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageHash: results._imageHash }),
    })
    const json = await resp.json()
    if (json.status === 'success') {
      setHint(json.data.hint_question)
    }
  } catch (err) {
    console.error('Hint request failed:', err)
  } finally {
    setIsHintLoading(false)
  }
}, [results])
```

#### 7.4 Wire `onReveal()` to API

Replace the stub in [`Dashboard.jsx`](client/src/pages/Dashboard.jsx:479):

```jsx
const handleReveal = useCallback(async () => {
  if (!results?._imageHash || !residentInput.trim()) return
  setIsRevealed(false) // will be set to true on success
  try {
    const resp = await fetch(`${API_BASE}/api/analyze-scan/reveal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        imageHash: results._imageHash,
        residentAssessment: residentInput,
      }),
    })
    const json = await resp.json()
    if (json.status === 'success') {
      setResults(prev => ({
        ...prev,
        verified_report: json.data.verified_report,
        diagnosis_match: json.data.diagnosis_match,
      }))
      setIsRevealed(true)
    }
  } catch (err) {
    console.error('Reveal failed:', err)
  }
}, [results, residentInput])
```

#### 7.5 Fix `engineMode` Check in ResultsPanel

In [`ResultsPanel.jsx`](client/src/components/Dashboard/ResultsPanel.jsx:47), change:

```jsx
{engineMode === 'discovery' && results && !isRevealed && ( ... )}
```
to:
```jsx
{engineMode === 'edu' && results && !isRevealed && ( ... )}
```

And at line 84:
```jsx
{engineMode === 'discovery' && !isRevealed && ( ... )}
```
to:
```jsx
{engineMode === 'edu' && !isRevealed && ( ... )}
```

#### 7.6 Add Diagnosis Match Display

After reveal, show a diagnosis match scorecard in [`ResultsPanel.jsx`](client/src/components/Dashboard/ResultsPanel.jsx):

```jsx
{isRevealed && results?.diagnosis_match && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 rounded-xl border border-indigo-500/30 bg-indigo-950/20"
  >
    <h3 className="text-sm font-bold text-white mb-4">Diagnosis Match Score</h3>
    <div className="flex items-center gap-6">
      <ConfidenceGauge value={results.diagnosis_match.score} />
      <div className="space-y-2">
        <p className="text-xs text-slate-400">
          Matched: <span className="text-emerald-400 font-bold">{results.diagnosis_match.matched}</span>
        </p>
        <p className="text-xs text-slate-400">
          Missed: <span className="text-red-400 font-bold">{results.diagnosis_match.missed}</span>
        </p>
        <p className="text-xs text-slate-400">
          Extra: <span className="text-amber-400 font-bold">{results.diagnosis_match.extra}</span>
        </p>
      </div>
    </div>
  </motion.div>
)}
```

---

## 8. Responsive Design

### Breakpoint Strategy

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| `sm` | 640px+ | Single column → two columns for feature grid |
| `md` | 768px+ | Header horizontal, sidebar visible |
| `lg` | 1024px+ | Dashboard 2-column grid, full analytics |
| `xl` | 1280px+ | Max-width container, ample whitespace |

### Key Responsive Patterns

1. **Dashboard Grid**: `grid-cols-1 lg:grid-cols-2` — stacks on mobile, side-by-side on desktop
2. **Header**: `flex-col md:flex-row` — stacked on mobile, horizontal on desktop
3. **Analytics Cards**: `grid-cols-2 md:grid-cols-3` — 2 columns mobile, 3 on tablet+
4. **Hero Section**: `grid md:grid-cols-2` — stacked on mobile, side-by-side on desktop
5. **Feature Grid**: `grid md:grid-cols-3` — single column mobile, 3 columns desktop
6. **Mode Selector**: `flex-wrap` — wraps on small screens

### Mobile-Specific Considerations

- Touch targets: minimum 44×44px for all interactive elements
- Swipe gestures for scan history sidebar
- Reduced motion media query: `prefers-reduced-motion: reduce`
- Simplified particle effects on mobile (reduce particle count by 75%)
- Bottom sheet instead of sidebar for mobile scan history

---

## 9. Accessibility

### ARIA Attributes

| Component | ARIA |
|-----------|------|
| Header nav | `role="navigation" aria-label="Main navigation"` |
| Mode selector | `role="radiogroup" aria-label="Engine mode"` |
| Buttons | `aria-label` for icon-only buttons |
| Upload zone | `role="button" aria-label="Upload X-ray image"` |
| Swarm visualizer | `role="status" aria-live="polite"` |
| Results panel | `role="region" aria-label="Analysis results"` |
| Error messages | `role="alert"` |
| Toast notifications | `role="status" aria-live="polite"` |

### Keyboard Navigation

- All interactive elements focusable and operable via keyboard
- Tab order follows visual order
- Escape key clears selection / closes modals
- Ctrl+Enter triggers analysis (already implemented)
- Focus trap in modals and sidebar
- Visible focus indicators (ring offset)

### Color Contrast

| Combination | Ratio | WCAG |
|-------------|-------|------|
| White text on slate-950 bg | 15.3:1 | ✅ AAA |
| Cyan-400 text on slate-950 bg | 6.5:1 | ✅ AA |
| Slate-300 text on slate-950 bg | 10.5:1 | ✅ AAA |
| Slate-400 text on slate-950 bg | 7.8:1 | ✅ AA |
| Slate-500 text on slate-950 bg | 5.7:1 | ✅ AA (large text) |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Performance Optimization

### Bundle Size

| Strategy | Implementation | Estimated Savings |
|----------|---------------|-------------------|
| Route-based code splitting | `React.lazy` + `Suspense` | 40-60% initial bundle |
| Tree-shaking | Already using named imports from lucide-react | Already optimal |
| Dynamic imports for heavy components | ParticleField, Charts | 100KB deferred |
| Preload critical CSS | Inline above-fold styles | First paint improvement |

### Rendering Performance

| Strategy | Implementation |
|----------|---------------|
| `React.memo` | Pure display components (StatCard, Badge, AgentRow) |
| `useMemo` | Expensive computations (confidence score, report parsing) |
| `useCallback` | Event handlers passed as props |
| Virtual list | ScanHistorySidebar if > 50 items |
| Image lazy loading | `loading="lazy"` on all `<img>` tags |

### Animation Performance

- Use `transform` and `opacity` only (GPU-composited)
- Avoid animating `width`, `height`, `top`, `left` (triggers layout)
- Use `will-change: transform` sparingly (only on actively animating elements)
- Canvas for particle effects (offloads from DOM)
- `requestAnimationFrame` for continuous animations

### Network Optimization

- SSE streaming with 1MB buffer guard (already implemented)
- Image compression before upload (canvas resize to 1024px max dimension)
- API response caching with SWR pattern
- Prefetch analytics data on dashboard mount

### Build Optimization

- Vite already handles code splitting, CSS minification
- Enable `build.rollupOptions.output.manualChunks` for vendor splitting
- Enable `build.cssMinify` (already default in Vite 8)
- Enable `build.sourcemap: false` for production

---

## 11. Implementation Plan

### Phase 1: Foundation (Strategy Document + Architecture)

| # | Task | Files | Est. Time |
|---|------|-------|-----------|
| 1.1 | Create this strategy document | `plans/frontend-winning-strategy.md` | Done |
| 1.2 | Create utility files | `client/src/utils/cn.js`, `formatters.js`, `constants.js` | 15 min |
| 1.3 | Create shared hooks | `useSSE.js`, `useScrollProgress.js`, `useMediaQuery.js`, `useMousePosition.js` | 30 min |
| 1.4 | Create UI component library | `Button.jsx`, `Card.jsx`, `Badge.jsx`, `Input.jsx`, `Modal.jsx`, `Toast.jsx`, `Skeleton.jsx`, `Tooltip.jsx` | 60 min |

### Phase 2: Visual Effects

| # | Task | Files | Est. Time |
|---|------|-------|-----------|
| 2.1 | Particle field component | `client/src/components/effects/ParticleField.jsx` | 20 min |
| 2.2 | Gradient orb background | `client/src/components/effects/GradientOrb.jsx` | 15 min |
| 2.3 | Glitch text component | `client/src/components/effects/GlitchText.jsx` | 10 min |
| 2.4 | Cursor glow effect | `client/src/components/effects/CursorGlow.jsx` | 10 min |
| 2.5 | Grid overlay | `client/src/components/effects/GridOverlay.jsx` | 5 min |

### Phase 3: Page Transitions + Layout

| # | Task | Files | Est. Time |
|---|------|-------|-----------|
| 3.1 | Unified PageTransition component | `client/src/components/layout/PageTransition.jsx` | 10 min |
| 3.2 | Enhanced App.jsx with lazy loading | `client/src/App.jsx` | 20 min |
| 3.3 | Scroll-aware Header | `client/src/Header.jsx` | 15 min |
| 3.4 | Enhanced Footer | `client/src/Footer.jsx` | 10 min |

### Phase 4: Education Mode Integration

| # | Task | Files | Est. Time |
|---|------|-------|-----------|
| 4.1 | Add edu mode button to Dashboard | `client/src/pages/Dashboard.jsx` | 10 min |
| 4.2 | Wire analyzeScan for mode=edu | `client/src/pages/Dashboard.jsx` | 5 min |
| 4.3 | Wire requestHint to API | `client/src/pages/Dashboard.jsx` | 10 min |
| 4.4 | Wire onReveal to API | `client/src/pages/Dashboard.jsx` | 10 min |
| 4.5 | Fix engineMode checks in ResultsPanel | `client/src/components/Dashboard/ResultsPanel.jsx` | 5 min |
| 4.6 | Add diagnosis match display | `client/src/components/Dashboard/ResultsPanel.jsx` | 15 min |

### Phase 5: Data Visualization

| # | Task | Files | Est. Time |
|---|------|-------|-----------|
| 5.1 | ConfidenceGauge component | `client/src/components/charts/ConfidenceGauge.jsx` | 15 min |
| 5.2 | Enhanced Sparkline with tooltips | `client/src/components/charts/Sparkline.jsx` | 15 min |
| 5.3 | DepartmentChart component | `client/src/components/charts/DepartmentChart.jsx` | 15 min |
| 5.4 | Enhanced SwarmVisualizer | `client/src/components/dashboard/SwarmVisualizer.jsx` | 30 min |
| 5.5 | Enhanced AnalyticsPage | `client/src/pages/AnalyticsPage.jsx` | 30 min |

### Phase 6: Polish + Performance

| # | Task | Files | Est. Time |
|---|------|-------|-----------|
| 6.1 | Add reduced motion support | `client/src/index.css` | 5 min |
| 6.2 | Add ARIA attributes | All components | 20 min |
| 6.3 | Keyboard navigation audit | All interactive components | 15 min |
| 6.4 | Responsive testing + fixes | All pages | 30 min |
| 6.5 | Performance audit + code splitting | `client/src/App.jsx` | 15 min |

---

## 12. File Manifest

### New Files to Create

```
client/src/utils/cn.js
client/src/utils/formatters.js
client/src/utils/constants.js
client/src/hooks/useSSE.js
client/src/hooks/useScrollProgress.js
client/src/hooks/useMediaQuery.js
client/src/hooks/useMousePosition.js
client/src/hooks/useIntersectionObserver.js
client/src/hooks/useLocalStorage.js
client/src/components/ui/Button.jsx
client/src/components/ui/Card.jsx
client/src/components/ui/Badge.jsx
client/src/components/ui/Input.jsx
client/src/components/ui/Modal.jsx
client/src/components/ui/Toast.jsx
client/src/components/ui/Skeleton.jsx
client/src/components/ui/Tooltip.jsx
client/src/components/ui/ProgressBar.jsx
client/src/components/ui/index.js
client/src/components/layout/PageTransition.jsx
client/src/components/layout/Container.jsx
client/src/components/effects/ParticleField.jsx
client/src/components/effects/GridOverlay.jsx
client/src/components/effects/ScanLine.jsx
client/src/components/effects/GlitchText.jsx
client/src/components/effects/GradientOrb.jsx
client/src/components/effects/CursorGlow.jsx
client/src/components/charts/ConfidenceGauge.jsx
client/src/components/charts/DepartmentChart.jsx
client/src/components/dashboard/EngineModeSelector.jsx
```

### Files to Modify

```
client/src/App.jsx                    → Add lazy loading, unified transitions
client/src/index.css                  → Add reduced motion, keyframes
client/src/Header.jsx                 → Scroll-aware glass effect
client/src/Footer.jsx                 → Enhanced animations
client/src/LandingPage.jsx            → Add particle field, gradient orbs