/**
 * Toast — Global toast notification system.
 * Usage: wrap app with <ToastProvider>, then useToast() to show toasts.
 */
import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])
    const idRef = useRef(0)

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = ++idRef.current
        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const typeStyles = {
        info: 'border-cyan-500/30 bg-slate-900 text-white',
        success: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400',
        error: 'border-red-500/30 bg-red-950/20 text-red-400',
        warning: 'border-amber-500/30 bg-amber-950/20 text-amber-400',
    }

    const typeDots = {
        info: 'bg-cyan-400',
        success: 'bg-emerald-400',
        error: 'bg-red-400',
        warning: 'bg-amber-400',
    }

    return (
        <ToastContext.Provider value={showToast}>
            {children}

            {/* Toast container */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className={`
                pointer-events-auto px-5 py-3 rounded-xl border shadow-2xl
                flex items-center gap-3 min-w-[280px] max-w-[420px]
                ${typeStyles[toast.type] || typeStyles.info}
              `}
                        >
                            <div className={`w-2 h-2 rounded-full animate-pulse ${typeDots[toast.type] || typeDots.info}`} />
                            <p className="text-sm font-medium flex-1">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-slate-500 hover:text-white transition-colors shrink-0"
                                aria-label="Dismiss"
                            >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used within ToastProvider')
    return ctx
}
