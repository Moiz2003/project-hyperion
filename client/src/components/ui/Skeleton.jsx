/**
 * Skeleton — Loading placeholder components.
 */
export function SkeletonCard() {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 flex flex-col gap-3 animate-pulse">
            <div className="h-2.5 w-24 rounded bg-slate-800" />
            <div className="h-8 w-16 rounded bg-slate-800" />
            <div className="h-2 w-32 rounded bg-slate-800/60" />
        </div>
    )
}

export function SkeletonSection({ rows = 1, height = 'h-16' }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 animate-pulse space-y-4">
            <div className="h-2.5 w-40 rounded bg-slate-800" />
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className={`${height} w-full rounded bg-slate-800/60`} />
            ))}
        </div>
    )
}

export function AnalyticsSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
            <SkeletonSection rows={3} height="h-2" />
            <SkeletonSection rows={1} height="h-16" />
        </div>
    )
}

export function PageSkeleton() {
    return (
        <div className="min-h-screen bg-[#020617] p-6 space-y-8">
            <div className="h-16 w-48 rounded-lg bg-slate-800/50 animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SkeletonSection rows={4} height="h-24" />
                <SkeletonSection rows={4} height="h-24" />
            </div>
        </div>
    )
}
