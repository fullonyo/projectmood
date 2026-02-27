import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Activity, Users, Settings, ShieldAlert, Database, ChevronLeft, History, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { AdminNav } from "@/components/admin/admin-nav"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard")
    }

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

                <div className="p-4 flex-1 space-y-1 overflow-y-auto">
                    <div className="px-2 mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Modules</p>
                    </div>
                    <AdminNav />
                </div>

                <div className="p-4 border-t border-zinc-900 space-y-3">
                    <div className="px-3 py-2 flex items-center gap-3 bg-white/5 border border-white/5">
                        <div className="w-6 h-6 bg-zinc-800 flex items-center justify-center text-[10px] font-black uppercase">
                            {session?.user?.username?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black truncate">@{session?.user?.username}</p>
                            <p className="text-[8px] font-mono text-zinc-500 uppercase">Administrator</p>
                        </div>
                    </div>

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
