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
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-emerald-500 animate-pulse rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Live Console</span>
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Command Center</h1>
                    <p className="text-sm text-zinc-500 font-mono mt-1">Real-time ecosystem intelligence and monitoring.</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                    <span className="uppercase tracking-widest">System Status:</span>
                    <span className="text-zinc-100 border border-zinc-800 px-2 py-1 bg-zinc-900/50">STABLE</span>
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
                            <div key={role.role} className="flex items-center justify-between p-3 border border-zinc-900 bg-zinc-950/50">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{role.role}</span>
                                <span className="text-lg font-black tracking-tighter">{role.count}</span>
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
                            <div key={user.id} className="flex flex-col gap-1 border-l border-zinc-800 pl-4 py-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-xs font-black", user.isBanned ? "text-red-500 line-through" : "text-zinc-200")}>
                                            @{user.username}
                                        </span>
                                        {user.isBanned && (
                                            <Badge className="h-3 text-[7px] bg-red-900/20 text-red-500 border-red-500/20 px-1 py-0 rounded-none leading-none inline-flex items-center">
                                                BANNED
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-[9px] font-mono text-zinc-600 uppercase">
                                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: ptBR })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">New Registration</div>
                                    <span className="px-1 bg-zinc-900 text-[8px] border border-zinc-800 text-zinc-400 font-bold uppercase">{user.role}</span>
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
