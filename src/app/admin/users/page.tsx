import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Shield, Ban, CheckCircle2, Search, Link as LinkIcon } from "lucide-react"
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
    if ((session?.user as any)?.role !== "ADMIN") redirect("/dashboard")

    const currentPage = Number(page) || 1
    const pageSize = 20
    const searchTerm = search || ""

    const whereClause = searchTerm ? {
        OR: [
            { username: { contains: searchTerm, mode: "insensitive" as any } },
            { email: { contains: searchTerm, mode: "insensitive" as any } }
        ]
    } : {}

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
        <div className="space-y-6">
            <header className="flex items-end justify-between mb-8 border-b border-zinc-900 pb-6">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter">Citizens Registry</h1>
                    <p className="text-sm text-zinc-500 font-mono mt-1">Manage platform population and moderations.</p>
                </div>
                <div className="text-right">
                    <div className="text-xs font-mono text-zinc-500 uppercase">Total Population</div>
                    <div className="text-xl font-black">{totalCount.toLocaleString()}</div>
                </div>
            </header>

            {/* Quick Search (Note: In a pure RSC this would need a client component form, but keeping it simple for now) */}
            <div className="bg-[#0a0a0a] border border-zinc-900 p-4 flex items-center gap-4">
                <Search className="w-4 h-4 text-zinc-500" />
                <form action="/admin/users" className="flex-1">
                    <input
                        name="search"
                        defaultValue={searchTerm}
                        placeholder="Search username or email..."
                        className="w-full bg-transparent border-none text-sm text-white focus:outline-none focus:ring-0 placeholder:text-zinc-700"
                    />
                </form>
            </div>

            <div className="border border-zinc-900 bg-[#0a0a0a] overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            <th className="px-6 py-4">Status & Role</th>
                            <th className="px-6 py-4">Identity</th>
                            <th className="px-6 py-4 text-right">Blocks</th>
                            <th className="px-6 py-4">Joined At</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/50">
                        {users.map((user: any) => (
                            <tr key={user.id} className="hover:bg-zinc-900/40 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {user.isBanned ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-wider">
                                                <Ban className="w-3 h-3" /> Banned
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-wider">
                                                <CheckCircle2 className="w-3 h-3" /> Active
                                            </span>
                                        )}
                                        {user.isVerified && (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-wider">
                                                <CheckCircle2 className="w-3 h-3" /> Verified
                                            </span>
                                        )}
                                        {user.role === 'ADMIN' && (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-wider">
                                                <Shield className="w-3 h-3" /> Admin
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-sm">{user.username}</div>
                                    <div className="text-xs text-zinc-500 font-mono mt-0.5">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-mono text-zinc-400">{user._count.moodBlocks}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs text-zinc-400">
                                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: ptBR })}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end items-center gap-3">
                                    <Link
                                        href={`/${user.username}`}
                                        target="_blank"
                                        className="text-zinc-500 hover:text-white transition-colors p-2"
                                        title="View Room"
                                    >
                                        <LinkIcon className="w-4 h-4" />
                                    </Link>
                                    <UserVerifyToggle
                                        userId={user.id}
                                        isVerified={user.isVerified}
                                        verificationType={user.verificationType}
                                    />
                                    {user.role !== 'ADMIN' && (
                                        <UserBanToggle userId={user.id} isBanned={user.isBanned} />
                                    )}
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

            {/* Simple Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border border-zinc-900 bg-[#0a0a0a] p-4 text-xs font-mono uppercase text-zinc-500">
                    <Link
                        href={`/admin/users?page=${currentPage - 1}&search=${searchTerm}`}
                        className={`hover:text-white ${currentPage === 1 ? 'pointer-events-none opacity-30' : ''}`}
                    >
                        &lt; Prev
                    </Link>
                    <span>Page {currentPage} of {totalPages}</span>
                    <Link
                        href={`/admin/users?page=${currentPage + 1}&search=${searchTerm}`}
                        className={`hover:text-white ${currentPage === totalPages ? 'pointer-events-none opacity-30' : ''}`}
                    >
                        Next &gt;
                    </Link>
                </div>
            )}
        </div>
    )
}
