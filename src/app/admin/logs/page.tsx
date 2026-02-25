import { getAuditLogs } from "@/actions/moderation";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    History,
    Shield,
    Trash2,
    UserMinus,
    CheckCircle,
    RefreshCcw,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string; action?: string; search?: string }>
}) {
    const { page, action, search } = await searchParams;
    const currentPage = parseInt(page || "1");
    const { logs, pagination } = await getAuditLogs(currentPage, 30, {
        action,
        targetId: search
    });

    const getActionIcon = (action: string) => {
        switch (action) {
            case "DELETE_BLOCK": return <Trash2 className="w-4 h-4 text-red-500" />;
            case "BAN_USER": return <UserMinus className="w-4 h-4 text-red-500" />;
            case "VERIFY_USER": return <CheckCircle className="w-4 h-4 text-blue-500" />;
            case "UNVERIFY_USER": return <UserMinus className="w-4 h-4 text-zinc-500" />;
            case "SYNC_FLAGS": return <RefreshCcw className="w-4 h-4 text-amber-500" />;
            case "UPDATE_FLAG": return <Settings className="w-4 h-4 text-blue-400" />;
            default: return <Shield className="w-4 h-4 text-zinc-500" />;
        }
    };

    const actionTypes = [
        "DELETE_BLOCK",
        "BAN_USER",
        "UNBAN_USER",
        "VERIFY_USER",
        "UNVERIFY_USER",
        "SYNC_FLAGS",
        "UPDATE_FLAG"
    ];

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-900 pb-10">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <History className="w-3 h-3 text-zinc-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">System Tracking & Audit</span>
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Moderation History</h1>
                    <p className="text-sm text-zinc-500 font-mono mt-1 max-w-xl">
                        Immutable ledger of administrative operations. Monitor authority actions and verify protocol compliance across the infrastructure.
                    </p>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest leading-none mb-1">Log Entries</div>
                        <div className="text-3xl font-black tabular-nums">{pagination.total.toLocaleString()}</div>
                    </div>
                </div>
            </header>

            {/* Filter & Search Bar */}
            <div className="space-y-4">
                <div className="bg-zinc-950/50 border border-zinc-900 p-1 flex flex-wrap items-center gap-4 focus-within:border-zinc-700 transition-colors">
                    <div className="pl-4 flex items-center gap-2">
                        <History className="w-4 h-4 text-zinc-700" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-800">Filter_Target:</span>
                    </div>
                    <form action="/admin/logs" className="flex-1 min-w-[300px]">
                        <input
                            name="search"
                            defaultValue={search}
                            placeholder="ENTITY_UID_OR_MANIFEST_ID..."
                            className="w-full h-12 bg-transparent border-none text-xs font-mono text-white focus:outline-none focus:ring-0 placeholder:text-zinc-800 uppercase tracking-widest"
                        />
                        {action && <input type="hidden" name="action" value={action} />}
                    </form>

                    <div className="h-8 w-px bg-zinc-900 hidden md:block" />

                    <div className="flex items-center gap-1 p-1">
                        <Link
                            href="/admin/logs"
                            className={cn(
                                "px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all",
                                !action
                                    ? "bg-white text-black border-white"
                                    : "text-zinc-500 border-transparent hover:border-zinc-800 hover:text-zinc-300"
                            )}
                        >
                            ALL_EVENTS
                        </Link>
                        {actionTypes.map(type => (
                            <Link
                                key={type}
                                href={`/admin/logs?action=${type}${search ? `&search=${search}` : ''}`}
                                className={cn(
                                    "px-3 py-2 text-[9px] font-black uppercase tracking-widest border transition-all",
                                    action === type
                                        ? "bg-zinc-100 text-black border-white"
                                        : "text-zinc-600 border-transparent hover:border-zinc-900 hover:text-zinc-400"
                                )}
                            >
                                {type.split('_')[0]}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border border-zinc-900 bg-zinc-950/30 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-900 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600 bg-zinc-950">
                            <th className="px-6 py-5">Timestamp</th>
                            <th className="px-6 py-5">Authority</th>
                            <th className="px-6 py-5">Protocol</th>
                            <th className="px-6 py-5">Target_Object</th>
                            <th className="px-6 py-5 text-right">Manifest_Payload</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/50">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-zinc-700 font-mono text-[10px] uppercase tracking-widest">
                                    No archive entries detected for the current scan.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-zinc-900/20 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black font-mono text-zinc-300 tabular-nums">
                                                {format(new Date(log.createdAt), "dd_MMM.HH:mm", { locale: ptBR }).toUpperCase()}
                                            </span>
                                            <span className="text-[8px] text-zinc-700 font-mono uppercase tracking-tighter">
                                                LOG_REF: {log.id.slice(0, 8).toUpperCase()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500 uppercase">
                                                {log.admin.username[0]}
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-tight text-zinc-300">
                                                @{log.admin.username}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="opacity-40 group-hover:opacity-100 transition-opacity">
                                                {getActionIcon(log.action)}
                                            </div>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest",
                                                log.action.includes("DELETE") || log.action.includes("BAN") ? "text-red-500/60" :
                                                    log.action.includes("VERIFY") ? "text-blue-500/60" : "text-zinc-500"
                                            )}>
                                                {log.action}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700 mb-0.5">{log.targetType}</span>
                                            <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[140px] border-b border-transparent group-hover:border-zinc-800 transition-all">
                                                {log.targetId}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {log.metadata && (
                                            <div className="flex flex-col items-end gap-1 font-mono">
                                                {Object.entries(log.metadata as Record<string, any>).map(([key, value]) => (
                                                    <div key={key} className="flex items-center gap-2 group/meta">
                                                        <span className="text-[7px] text-zinc-800 uppercase tracking-[0.2em] group-hover/meta:text-zinc-600 transition-colors">{key}:</span>
                                                        <span className="text-[9px] font-black text-zinc-500 group-hover/meta:text-zinc-300 transition-colors uppercase tabular-nums">
                                                            {typeof value === 'object' ? '...' : String(value)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Premium Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-between border-t border-zinc-900 pt-8 text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                    <Link
                        href={`/admin/logs?page=${currentPage - 1}${action ? `&action=${action}` : ''}${search ? `&search=${search}` : ''}`}
                        className={cn(
                            "flex items-center gap-3 hover:text-white px-4 py-2 border border-zinc-900 bg-zinc-950 transition-all",
                            currentPage === 1 && "pointer-events-none opacity-20"
                        )}
                    >
                        &lt; LOG_ARCHIVE_PREV
                    </Link>
                    <span className="font-black text-zinc-400 tabular-nums tracking-normal">LOGS PAGE {pagination.currentPage} // {pagination.pages}</span>
                    <Link
                        href={`/admin/logs?page=${currentPage + 1}${action ? `&action=${action}` : ''}${search ? `&search=${search}` : ''}`}
                        className={cn(
                            "flex items-center gap-3 hover:text-white px-4 py-2 border border-zinc-900 bg-zinc-950 transition-all",
                            currentPage === pagination.pages && "pointer-events-none opacity-20"
                        )}
                    >
                        LOG_ARCHIVE_NEXT &gt;
                    </Link>
                </div>
            )}
        </div>
    )
}
