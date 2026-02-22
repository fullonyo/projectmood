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
        <div className="space-y-8 max-w-5xl mx-auto">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <History className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Tracking</span>
                </div>
                <h1 className="text-3xl font-black tracking-tighter">Histórico de Moderação</h1>
                <p className="text-zinc-500 text-sm max-w-xl">
                    Registro detalhado de todas as ações administrativas realizadas no sistema.
                </p>
            </header>

            {/* Filter Bar */}
            <div className="bg-[#0a0a0a] border border-zinc-900 p-4 flex flex-wrap items-center gap-4">
                <div className="flex-1 flex items-center gap-3 bg-zinc-950 px-3 py-2 border border-zinc-900">
                    <History className="w-4 h-4 text-zinc-600" />
                    <form action="/admin/logs" className="flex-1">
                        <input
                            name="search"
                            defaultValue={search}
                            placeholder="Filter by Target ID..."
                            className="bg-transparent border-none text-xs text-white focus:outline-none focus:ring-0 w-full placeholder:text-zinc-700 font-mono"
                        />
                        {action && <input type="hidden" name="action" value={action} />}
                    </form>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Action:</span>
                    <div className="flex gap-2">
                        <Link
                            href="/admin/logs"
                            className={cn(
                                "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-all",
                                !action ? "bg-white text-black border-white" : "text-zinc-500 border-zinc-900 hover:border-zinc-700"
                            )}
                        >
                            All
                        </Link>
                        {actionTypes.map(type => (
                            <Link
                                key={type}
                                href={`/admin/logs?action=${type}${search ? `&search=${search}` : ''}`}
                                className={cn(
                                    "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-all",
                                    action === type ? "bg-white text-black border-white" : "text-zinc-500 border-zinc-900 hover:border-zinc-700"
                                )}
                            >
                                {type.split('_')[0]}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-[#0a0a0a] border border-zinc-900 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-900 bg-zinc-900/20">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Data</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Admin</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Ação</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Alvo</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 italic text-sm">
                                    Nenhum log registrado ainda.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-mono text-zinc-300">
                                                {format(new Date(log.createdAt), "dd MMM, HH:mm", { locale: ptBR })}
                                            </span>
                                            <span className="text-[9px] text-zinc-600 font-mono">
                                                {format(new Date(log.createdAt), "yyyy")}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-black">
                                                {log.admin.username[0].toUpperCase()}
                                            </div>
                                            <span className="text-xs font-bold font-mono tracking-tighter">
                                                @{log.admin.username}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getActionIcon(log.action)}
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-tighter",
                                                log.action.includes("DELETE") || log.action.includes("BAN") ? "text-red-500/80" :
                                                    log.action.includes("VERIFY") ? "text-blue-500/80" : "text-zinc-400"
                                            )}>
                                                {log.action.replace("_", " ")}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-mono text-zinc-500">{log.targetType}</span>
                                            <span className="text-[11px] font-mono text-zinc-300 truncate max-w-[120px]">
                                                {log.targetId}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {log.metadata && (
                                            <div className="flex flex-col items-end gap-1">
                                                {Object.entries(log.metadata as Record<string, any>).map(([key, value]) => (
                                                    <div key={key} className="flex items-center gap-2">
                                                        <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">{key}:</span>
                                                        <span className="text-[10px] font-mono text-zinc-300 max-w-[150px] truncate">
                                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
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

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="p-4 border-t border-zinc-900 flex justify-between items-center bg-zinc-950/30">
                        <span className="text-[10px] font-mono text-zinc-600 uppercase">
                            Página {pagination.currentPage} de {pagination.pages}
                        </span>
                        <div className="flex gap-4">
                            {currentPage > 1 && (
                                <Link
                                    href={`/admin/logs?page=${currentPage - 1}${action ? `&action=${action}` : ''}${search ? `&search=${search}` : ''}`}
                                    className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                                >
                                    &lt; Anterior
                                </Link>
                            )}
                            {currentPage < pagination.pages && (
                                <Link
                                    href={`/admin/logs?page=${currentPage + 1}${action ? `&action=${action}` : ''}${search ? `&search=${search}` : ''}`}
                                    className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                                >
                                    Próximo &gt;
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
