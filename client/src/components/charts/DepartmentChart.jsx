/**
 * DepartmentChart — Horizontal bar chart for department distribution.
 */
import { motion } from 'framer-motion'

export default function DepartmentChart({ departments = [], maxCount = 1 }) {
    if (!departments || departments.length === 0) return null

    const max = maxCount || Math.max(...departments.map(d => d.count), 1)

    return (
        <div className="space-y-3">
            {departments.map((dept, i) => {
                const pct = (dept.count / max) * 100
                return (
                    <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-mono w-32 shrink-0 truncate" title={dept.dept}>
                            {dept.dept}
                        </span>
                        <div className="flex-1 h-5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.05 }}
                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                style={{
                                    boxShadow: '0 0 8px rgba(34, 211, 238, 0.3)',
                                }}
                            />
                        </div>
                        <span className="text-xs font-mono text-slate-400 w-8 text-right">
                            {dept.count}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}
