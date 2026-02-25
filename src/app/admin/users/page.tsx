import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Shield, Ban, CheckCircle2, Search, Link as LinkIcon, Users } from "lucide-react"
import Link from "next/link"
import { UserBanToggle } from "./user-ban-toggle"
import { UserVerifyToggle } from "./user-verify-toggle"

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string, search?: string }>
}) {
    const { page, search } = await searchParams;
    const session = await auth()
    if (session?.user?.role !== "ADMIN") redirect("/dashboard")

    const currentPage = Number(page) || 1
    const pageSize = 20
    const searchTerm = search || ""

    const whereClause: import("@prisma/client").Prisma.UserWhereInput = {
        deletedAt: null,
    }

    if (searchTerm) {
        whereClause.OR = [
            { username: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } }
        ]
    }

    const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { moodBlocks: true }
                }
            },
            orderBy: { createdAt: "desc" },
            skip: (currentPage - 1) * pageSize,
            take: pageSize
        }),
        prisma.user.count({ where: whereClause })
    ])

    const totalPages = Math.ceil(totalCount / pageSize)

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-900 pb-10">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="w-3 h-3 text-zinc-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Demographics & Safety</span>
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Citizens Registry</h1>
                    <p className="text-sm text-zinc-500 font-mono mt-1 max-w-xl">
                        Central authority for civilian monitoring. Manage permissions, identify anomalies, and enforce community standards.
                    </p>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest leading-none mb-1">Total Population</div>
                        <div className="text-3xl font-black tabular-nums">{totalCount.toLocaleString()}</div>
                    </div>
                </div>
            </header>

            {/* Quick Search */}
            <div className="bg-zinc-950/50 border border-zinc-900 p-1 flex items-center gap-4 focus-within:border-zinc-700 transition-colors">
                <div className="pl-4">
                    <Search className="w-4 h-4 text-zinc-600" />
                </div>
                <form action="/admin/users" className="flex-1">
                    <input
                        name="search"
                        defaultValue={searchTerm}
                        placeholder="IDENTIFY_BY_USERNAME_OR_EMAIL..."
                        className="w-full h-12 bg-transparent border-none text-xs font-mono text-white focus:outline-none focus:ring-0 placeholder:text-zinc-800 uppercase tracking-widest"
                    />
                </form>
            </div>

            <div className="border border-zinc-900 bg-zinc-950/30 overflow-hidden">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-zinc-900 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600 bg-zinc-950">
                            <th className="px-6 py-5">Status & Access</th>
                            <th className="px-6 py-5">Civilian Identity</th>
                            <th className="px-6 py-5 text-right">Blocks</th>
                            <th className="px-6 py-5">Registration Date</th>
                            <th className="px-6 py-5 text-right">Protocols</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/50">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-zinc-900/20 transition-colors group/row">
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {user.isBanned ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-red-500/20 bg-red-500/5 text-red-500 text-[8px] font-black uppercase tracking-widest">
                                                <Ban className="w-2.5 h-2.5" /> Isolated
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                                                <CheckCircle2 className="w-2.5 h-2.5" /> Active
                                            </span>
                                        )}
                                        {user.isVerified && (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-blue-500/20 bg-blue-500/5 text-blue-500 text-[8px] font-black uppercase tracking-widest">
                                                <Shield className="w-2.5 h-2.5" /> Verified
                                            </span>
                                        )}
                                        {user.role === 'ADMIN' && (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-zinc-500/20 bg-zinc-500/5 text-zinc-400 text-[8px] font-black uppercase tracking-widest">
                                                System Authority
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-black text-xs uppercase tracking-tight text-zinc-200">@{user.username}</div>
                                    <div className="text-[10px] text-zinc-600 font-mono mt-0.5 uppercase tracking-tighter">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-mono text-xs font-black tabular-nums text-zinc-400">{user._count.moodBlocks}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-[10px] font-mono uppercase text-zinc-500">
                                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: ptBR })}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                        <Link
                                            href={`/${user.username}`}
                                            target="_blank"
                                            className="h-8 w-8 flex items-center justify-center text-zinc-600 hover:text-white transition-colors border border-transparent hover:border-zinc-800 hover:bg-zinc-900"
                                            title="View Room"
                                        >
                                            <LinkIcon className="w-3.5 h-3.5" />
                                        </Link>
                                        <div className="w-px h-4 bg-zinc-900 mx-1" />
                                        <UserVerifyToggle
                                            userId={user.id}
                                            isVerified={user.isVerified}
                                            verificationType={user.verificationType}
                                        />
                                        {user.role !== 'ADMIN' && (
                                            <UserBanToggle userId={user.id} isBanned={user.isBanned} />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-mono text-sm">
                                    No citizens found in the registry.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Premium Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-zinc-900 pt-8 text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                    <Link
                        href={`/admin/users?page=${currentPage - 1}&search=${searchTerm}`}
                        className={`flex items-center gap-3 hover:text-white px-4 py-2 border border-zinc-900 bg-zinc-950 transition-all ${currentPage === 1 ? 'pointer-events-none opacity-20' : ''}`}
                    >
                        &lt; ARCHIVE_PREV
                    </Link>
                    <span className="font-black text-zinc-400 tabular-nums tracking-normal">LOG PAGE {currentPage} // {totalPages}</span>
                    <Link
                        href={`/admin/users?page=${currentPage + 1}&search=${searchTerm}`}
                        className={`flex items-center gap-3 hover:text-white px-4 py-2 border border-zinc-900 bg-zinc-950 transition-all ${currentPage === totalPages ? 'pointer-events-none opacity-20' : ''}`}
                    >
                        ARCHIVE_NEXT &gt;
                    </Link>
                </div>
            )}
        </div>
    )
}
