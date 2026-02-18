"use client"

import { useEffect, useState } from "react"
import { Eye, TrendingUp, Users } from "lucide-react"

interface AnalyticsDisplayProps {
    profileId: string
}

export function AnalyticsDisplay({ profileId }: AnalyticsDisplayProps) {
    const [views, setViews] = useState<number>(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Increment view count on mount
        fetch(`/api/analytics/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profileId })
        }).catch(console.error)

        // Fetch current view count
        fetch(`/api/analytics/views?profileId=${profileId}`)
            .then(res => res.json())
            .then(data => {
                setViews(data.views || 0)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [profileId])

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">
                            Visualizações
                        </p>
                        <p className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tabular-nums">
                            {loading ? '---' : views.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
