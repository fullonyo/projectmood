import { getAuditFeed } from "@/actions/moderation"
import { AuditCard } from "@/components/admin/audit-card"
import { Shield, LayoutGrid, AlertTriangle } from "lucide-react"

interface AuditPageProps {
    searchParams: { page?: string }
}

export default async function AuditPage({ searchParams }: AuditPageProps) {
    const page = parseInt(searchParams.page || "1")
    const { blocks, pagination } = await getAuditFeed(page, 24)

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-red-500 animate-pulse rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Moderation Active</span>
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Visual Audit Feed</h1>
                    <p className="text-sm text-zinc-500 font-mono mt-1">Global content manifest for rapid integrity management.</p>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <div className="text-[10px] font-mono text-zinc-500 uppercase">Live Objects</div>
                        <div className="text-2xl font-black">{pagination.total}</div>
                    </div>
                    <div className="h-10 w-px bg-zinc-900" />
                    <div className="text-right">
                        <div className="text-[10px] font-mono text-zinc-500 uppercase">Current Page</div>
                        <div className="text-2xl font-black">{pagination.currentPage} / {pagination.pages}</div>
                    </div>
                </div>
            </header>

            {/* Warning Section if any */}
            {pagination.total === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center border border-dashed border-zinc-900 text-zinc-600">
                    <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest">No transmissions detected in the manifest</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {blocks.map((block: any) => (
                            <AuditCard key={block.id} block={block} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-center gap-1 pt-10">
                        {page > 1 && (
                            <a
                                href={`/admin/audit?page=${page - 1}`}
                                className="px-6 py-2 border border-zinc-900 bg-zinc-950 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all"
                            >
                                Previous
                            </a>
                        )}
                        {page < pagination.pages && (
                            <a
                                href={`/admin/audit?page=${page + 1}`}
                                className="px-6 py-2 border border-zinc-900 bg-zinc-950 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all"
                            >
                                Next
                            </a>
                        )}
                    </div>
                </>
            )}

            <footer className="pt-10 flex items-center justify-between border-t border-zinc-900 opacity-30">
                <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                    <Shield className="w-3 h-3" />
                    <span>Integrity Protocol: V2-AUDIT</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500 italic">
                    <AlertTriangle className="w-3 h-3" />
                    All deletions are permanent and logged for audit.
                </div>
            </footer>
        </div>
    )
}
