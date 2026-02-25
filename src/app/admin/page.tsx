import { Users, Eye, Zap, Activity, ShieldAlert, UserX, CheckCircle2 } from "lucide-react"
import { getAdminAnalytics } from "@/actions/admin-analytics"
import { MetricCard } from "@/components/admin/metric-card"
import { UsageChart } from "@/components/admin/usage-chart"
import { GrowthChart } from "@/components/admin/growth-chart"
import { SystemHealth } from "@/components/admin/system-health"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default async function AdminDashboardPage() {
    const { metrics, blockUsage, recentUsers, growthData, roleDistribution, verificationDistribution } = await getAdminAnalytics()

    const calculateTrend = (current: number, prev: number) => {
        if (prev === 0) return { value: "100%", isUp: current > 0 }
        const diff = ((current - prev) / prev) * 100
        return {
            value: `${Math.abs(Math.round(diff))}%`,
            isUp: diff >= 0
        }
    }

    const userTrend = calculateTrend(metrics.newUsers24h.current, metrics.newUsers24h.prev)
    const activeTrend = calculateTrend(metrics.activeProfiles7d.current, metrics.activeProfiles7d.prev)

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-900 pb-10">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-3 h-3 text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500">Live Infrastructure Monitoring</span>
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Command Center</h1>
                    <p className="text-sm text-zinc-500 font-mono mt-1 max-w-xl">
                        Real-time ecosystem intelligence. Monitor civilian growth, system health, and enforce global standards from a single authority node.
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest leading-none mb-1">System Status</div>
                        <div className="flex items-center gap-2 justify-end">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xl font-black tracking-widest uppercase">STABLE</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* 1. Primary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Active Citizens"
                    value={metrics.totalUsers}
                    icon={Users}
                    description="Total non-deleted accounts"
                />
                <MetricCard
                    title="New Residents (24h)"
                    value={metrics.newUsers24h.current}
                    icon={Zap}
                    trend={userTrend}
                    description="vs. previous 24h period"
                />
                <MetricCard
                    title="Active Moods (7d)"
                    value={metrics.activeProfiles7d.current}
                    icon={Activity}
                    trend={activeTrend}
                    description="vs. previous week"
                />
                <MetricCard
                    title="Banned / Isolated"
                    value={metrics.bannedCount}
                    icon={UserX}
                    description="Protected access limit"
                    className={metrics.bannedCount > 0 ? "border-red-900/10 bg-red-950/5" : ""}
                />
                <MetricCard
                    title="Global Traffic"
                    value={metrics.totalViews}
                    icon={Eye}
                    highlight
                    description="Total profile impressions"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Growth Trajectory */}
                <div className="lg:col-span-2">
                    <GrowthChart data={growthData} title="30-Day Registration Velocity" />
                </div>

                {/* 3. Role Breakdown & Stats */}
                <div className="p-8 border border-zinc-900 bg-[#0a0a0a] flex flex-col">
                    <header className="flex items-center gap-3 mb-8">
                        <ShieldAlert className="w-4 h-4 text-zinc-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Civilian Distribution</h3>
                    </header>

                    <div className="space-y-4 flex-1">
                        {roleDistribution.map((role: any) => (
                            <div key={role.role} className="flex items-center justify-between p-3 border border-zinc-900 bg-zinc-950/30 group/item transition-colors hover:border-zinc-800">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover/item:text-zinc-400">{role.role}</span>
                                <span className="text-xl font-black tracking-tighter tabular-nums">{role.count}</span>
                            </div>
                        ))}
                    </div>

                    <header className="flex items-center gap-3 mt-10 mb-6">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Verification Status</h3>
                    </header>

                    <div className="space-y-3">
                        {verificationDistribution.map((v: any) => (
                            <div key={v.verificationType || 'verified'} className="flex items-center justify-between">
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600 italic">
                                    {v.verificationType || 'Standard'}
                                </span>
                                <span className="text-xs font-mono font-black">{v._count._all}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-zinc-900">
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Safety Ratio</span>
                            <span className="text-[10px] font-black text-emerald-500">
                                {metrics.totalUsers > 0 ? (((metrics.totalUsers - metrics.bannedCount) / metrics.totalUsers) * 100).toFixed(1) : 0}% Active
                            </span>
                        </div>
                        <div className="h-1 bg-zinc-900 mt-2 overflow-hidden">
                            <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${metrics.totalUsers > 0 ? ((metrics.totalUsers - metrics.bannedCount) / metrics.totalUsers) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. System Health & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <SystemHealth />
                    <UsageChart
                        data={blockUsage}
                        title="Composition Analysis"
                    />
                </div>

                <div className="lg:col-span-4 bg-[#0a0a0a] border border-zinc-900 p-8">
                    <header className="flex items-center gap-3 mb-8">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Recent Activity</h3>
                    </header>

                    <div className="space-y-6">
                        {recentUsers.map((user: any) => (
                            <div key={user.id} className="flex flex-col gap-1 border-l border-zinc-900 pl-4 py-1 group/act hover:border-zinc-700 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-xs font-black uppercase tracking-tight transition-colors", user.isBanned ? "text-red-500/50 line-through" : "text-zinc-200 group-hover/act:text-white")}>
                                            @{user.username}
                                        </span>
                                        {user.isBanned && (
                                            <span className="text-[7px] font-black bg-red-500/10 text-red-500 border border-red-500/20 px-1 py-0 uppercase tracking-widest">
                                                Isolated
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-tighter">
                                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: ptBR }).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Log: NEW_REGISTRATION</div>
                                    <span className="px-1 bg-zinc-900 text-[7px] border border-zinc-800 text-zinc-500 font-bold uppercase tracking-widest">{user.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-8 py-3 border border-zinc-900 bg-zinc-950 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all">
                        Monitor Deep Archive
                    </button>
                </div>
            </div>

            {/* Subtle Footer status */}
            <footer className="pt-10 flex items-center justify-between border-t border-zinc-900 opacity-30">
                <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                    <span>Protocol: v2.2-ALC</span>
                    <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                    <span>Scale: HIGH_RELIABILITY</span>
                    <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                    <span>{new Date().toISOString()}</span>
                </div>
                <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                    &copy; 96E46887 COMMAND CENTER
                </div>
            </footer>
        </div>
    )
}
