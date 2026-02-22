"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Activity, Users, Settings, Database, History } from "lucide-react"

const navigation = [
    { name: "Command Center", href: "/admin", icon: Activity },
    { name: "Visual Audit", href: "/admin/audit", icon: Database },
    { name: "Histórico Admin", href: "/admin/logs", icon: History },
    { name: "Users & Moderation", href: "/admin/users", icon: Users },
    { name: "System Config", href: "/admin/config", icon: Settings },
]

export function AdminNav() {
    const pathname = usePathname()

    return (
        <div className="space-y-1">
            {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 text-sm transition-all rounded-md group",
                            isActive
                                ? "text-white bg-zinc-900 shadow-sm border border-white/5"
                                : "text-zinc-500 hover:text-white hover:bg-zinc-900/50"
                        )}
                    >
                        <item.icon className={cn(
                            "w-4 h-4",
                            isActive ? "text-white" : "text-zinc-500 group-hover:text-white"
                        )} />
                        <span className={cn(
                            "font-medium tracking-wide",
                            isActive ? "text-white" : ""
                        )}>{item.name}</span>
                        {isActive && (
                            <div className="ml-auto w-1 h-1 bg-white rounded-full" />
                        )}
                    </Link>
                )
            })}
        </div>
    )
}
