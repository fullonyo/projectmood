import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Activity, Users, Settings, ShieldAlert, Database, ChevronLeft, History } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    // Double-check protection (Middleware handles edge, this handles internal routing)
    if ((session?.user as any)?.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const navigation = [
        { name: "Command Center", href: "/admin", icon: Activity },
        { name: "Visual Audit", href: "/admin/audit", icon: Database },
        { name: "Histórico Admin", href: "/admin/logs", icon: History },
        { name: "Users & Moderation", href: "/admin/users", icon: Users },
        { name: "System Config", href: "/admin/config", icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-[#050505] text-[#ededed] font-sans selection:bg-white selection:text-black flex">
            {/* Minimalist Hacker Sidebar */}
            <aside className="w-64 border-r border-zinc-900 bg-[#0a0a0a] flex flex-col hidden md:flex shrink-0">
                <div className="h-16 flex items-center px-6 border-b border-zinc-900">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">SysAdmin</span>
                    </div>
                </div>

                <div className="p-4 flex-1 space-y-1">
                    <div className="px-2 mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Modules</p>
                    </div>
                    {navigation.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900/50 rounded-md transition-all group"
                        >
                            <item.icon className="w-4 h-4 group-hover:text-white" />
                            <span className="font-medium tracking-wide">{item.name}</span>
                        </Link>
                    ))}
                </div>

                <div className="p-4 border-t border-zinc-900">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-500 hover:text-white transition-all group"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Exit Console</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Subtle Grid Background */}
                <div
                    className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                <div className="flex-1 overflow-y-auto relative z-10 p-6 md:p-8 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    )
}
