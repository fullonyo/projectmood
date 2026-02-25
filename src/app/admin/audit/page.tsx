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
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-900 pb-10">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-3 h-3 text-red-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500">Security & Integrity</span>
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Visual Audit Feed</h1>
                    <p className="text-sm text-zinc-500 font-mono mt-1 max-w-xl">
                        Global oversight of civilian transmissions. Monitor content integrity and enforce administrative protocols in real-time.
                    </p>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest leading-none mb-1">Manifest Objects</div>
                        <div className="text-3xl font-black tabular-nums">{pagination.total.toLocaleString()}</div>
                    </div>
                    <div className="h-10 w-px bg-zinc-900" />
                    <div className="text-right">
                        <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest leading-none mb-1">Page Index</div>
                        <div className="text-3xl font-black tabular-nums">{pagination.currentPage} / {pagination.pages}</div>
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

                    {/* Premium Pagination */}
                    <div className="flex items-center justify-between border-t border-zinc-900 pt-8 text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                        {page > 1 ? (
                            <a
                                href={`/admin/audit?page=${page - 1}`}
                                className="flex items-center gap-3 hover:text-white px-4 py-2 border border-zinc-900 bg-zinc-950 transition-all"
                            >
                                &lt; MANIFEST_PREV
                            </a>
                        ) : (
                            <div className="px-4 py-2 border border-zinc-900 bg-zinc-950/20 opacity-20 pointer-events-none">
                                &lt; MANIFEST_PREV
                            </div>
                        )}
                        <span className="font-black text-zinc-400 tabular-nums tracking-normal uppercase">
                            DEEP SCAN: PAGE {pagination.currentPage} // {pagination.pages}
                        </span>
                        {page < pagination.pages ? (
                            <a
                                href={`/admin/audit?page=${page + 1}`}
                                className="flex items-center gap-3 hover:text-white px-4 py-2 border border-zinc-900 bg-zinc-950 transition-all"
                            >
                                MANIFEST_NEXT &gt;
                            </a>
                        ) : (
                            <div className="px-4 py-2 border border-zinc-900 bg-zinc-950/20 opacity-20 pointer-events-none">
                                MANIFEST_NEXT &gt;
                            </div>
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
