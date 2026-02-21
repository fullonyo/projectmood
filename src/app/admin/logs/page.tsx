import { getAuditLogs } from "@/actions/moderation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    History,
    Shield,
    Trash2,
    UserMinus,
    CheckCircle,
    RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const { page } = await searchParams;
    const currentPage = parseInt(page || "1");
    const { logs, pagination } = await getAuditLogs(currentPage);

    const getActionIcon = (action: string) => {
        switch (action) {
            case "DELETE_BLOCK": return <Trash2 className="w-4 h-4 text-red-500" />;
            case "BAN_USER": return <UserMinus className="w-4 h-4 text-red-500" />;
            case "VERIFY_USER": return <CheckCircle className="w-4 h-4 text-blue-500" />;
            case "UNVERIFY_USER": return <UserMinus className="w-4 h-4 text-zinc-500" />;
            case "SYNC_FLAGS": return <RefreshCcw className="w-4 h-4 text-amber-500" />;
            default: return <Shield className="w-4 h-4 text-zinc-500" />;
        }
    };

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
                                            <div className="text-[10px] font-mono text-zinc-600 italic group-hover:text-zinc-400 transition-colors">
                                                {JSON.stringify(log.metadata).slice(0, 40)}...
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
                            Pagína {pagination.currentPage} de {pagination.pages}
                        </span>
                        <div className="flex gap-2">
                            {/* Simple pagination links would go here, but let's keep it minimalist */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
