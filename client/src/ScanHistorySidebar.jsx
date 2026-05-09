import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Inline SVG icons to avoid external dependencies
const HistoryIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const ScanIcon = () => (
    <svg className="w-4 h-4 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
    </svg>
);

const AlertIcon = () => (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const STORAGE_KEY = 'hyperion_scan_history';

/**
 * ScanHistorySidebar — "Recent Scans" sidebar panel.
 * Fetches from MongoDB via GET /api/scans, falls back to localStorage.
 * Clicking a scan populates the main HUD with stored results.
 */
export default function ScanHistorySidebar({ onSelectScan, isOpen, onToggle }) {
    const [scans, setScans] = useState([]);
    const [source, setSource] = useState('local');
    const [loading, setLoading] = useState(false);

    const loadFromLocalStorage = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setScans(parsed);
                setSource('local');
            }
        } catch (e) {
            console.warn('Failed to load scan history from localStorage:', e.message);
        }
    }, []);

    const fetchScans = useCallback(async () => {
        setLoading(true);
        try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_BASE}/api/scans`);
            const json = await res.json();
            if (json.status === 'success' && json.data && json.data.length > 0) {
                setScans(json.data);
                setSource(json.source || 'mongodb');
                // Also cache in localStorage as fallback
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
                } catch (e) { /* quota exceeded — ignore */ }
            } else {
                // Fallback to localStorage
                loadFromLocalStorage();
            }
        } catch (err) {
            console.warn('Failed to fetch scan history from server, using localStorage:', err.message);
            loadFromLocalStorage();
        } finally {
            setLoading(false);
        }
    }, [loadFromLocalStorage]);

    // Save new scan results to localStorage when called externally
    const saveToLocalStorage = useCallback((result) => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const existing = stored ? JSON.parse(stored) : [];
            const updated = [{ ...result, createdAt: new Date().toISOString() }, ...existing].slice(0, 20);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setScans(updated);
            setSource('local');
        } catch (e) {
            console.warn('Failed to save to localStorage:', e.message);
        }
    }, []);

    // Expose saveToLocalStorage globally so App.jsx can call it
    useEffect(() => {
        window.__hyperionSaveScan = saveToLocalStorage;
        return () => { delete window.__hyperionSaveScan; };
    }, [saveToLocalStorage]);

    useEffect(() => {
        if (isOpen) {
            fetchScans();
        }
    }, [isOpen, fetchScans]);

    const formatDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch {
            return 'Unknown';
        }
    };

    const truncate = (str, len = 60) => {
        if (!str) return '';
        return str.length > len ? str.slice(0, len) + '...' : str;
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="fixed right-0 top-1/2 -translate-y-1/2 z-30 p-3 rounded-l-xl bg-slate-900/80 border border-r-0 border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all backdrop-blur-md shadow-lg"
                title="Recent Scans"
            >
                <HistoryIcon />
            </button>

            {/* Sidebar Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: 320 }}
                        animate={{ x: 0 }}
                        exit={{ x: 320 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-80 z-40 bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <HistoryIcon />
                                <h3 className="text-sm font-inter font-semibold tracking-widest uppercase text-slate-300">
                                    Recent Scans
                                </h3>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Source indicator */}
                        <div className="px-4 py-2 border-b border-slate-800/50">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
                                Source: {source === 'mongodb' ? 'Cloud DB' : 'Local Storage'}
                            </span>
                        </div>

                        {/* Scan List */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {loading && (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                                </div>
                            )}

                            {!loading && scans.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                                    <HistoryIcon />
                                    <p className="mt-3 text-xs font-mono tracking-wider">No scans recorded yet</p>
                                </div>
                            )}

                            {!loading && scans.map((scan, idx) => (
                                <motion.button
                                    key={scan._id || idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => onSelectScan(scan)}
                                    className="w-full text-left p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-400/50 hover:bg-cyan-950/20 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Thumbnail */}
                                        <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-700">
                                            {scan.imageBase64 ? (
                                                <img
                                                    src={`data:image/png;base64,${scan.imageBase64}`}
                                                    alt="Scan thumbnail"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ScanIcon />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {scan.urgencyFlag === 'High' && (
                                                    <span className="text-red-400"><AlertIcon /></span>
                                                )}
                                                <span className={`text-[10px] font-bold tracking-widest uppercase ${scan.urgencyFlag === 'High' ? 'text-red-400' : 'text-emerald-400'
                                                    }`}>
                                                    {scan.urgencyFlag || 'N/A'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 font-mono leading-relaxed truncate">
                                                {truncate(scan.verifiedReport || scan.rawFindings)}
                                            </p>
                                            <p className="text-[10px] text-slate-600 font-mono mt-1">
                                                {formatDate(scan.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-slate-800 text-center">
                            <p className="text-[9px] text-slate-700 font-mono uppercase tracking-widest">
                                {scans.length} scan{scans.length !== 1 ? 's' : ''} cached
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
