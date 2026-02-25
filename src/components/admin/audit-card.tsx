"use client"

import * as React from "react"
import { Trash2, UserX, ExternalLink, Calendar, User as UserIcon } from "lucide-react"
import Link from "next/link"
import { BlockRenderer } from "../dashboard/block-renderer"
import { adminDeleteBlock, adminBanUser } from "@/actions/moderation"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Badge } from "../ui/badge"

interface AuditCardProps {
    block: any
}

export function AuditCard({ block }: AuditCardProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [isBanning, setIsBanning] = React.useState(false)
    const [isVisible, setIsVisible] = React.useState(true)

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir este bloco permanentemente?")) return
        setIsDeleting(true)
        const res = await adminDeleteBlock(block.id)
        if (res.success) {
            setIsVisible(false)
            toast.success("Bloco removido com sucesso")
        } else {
            toast.error(res.error || "Erro ao excluir bloco.")
            setIsDeleting(false)
        }
    }

    const handleBan = async () => {
        if (!confirm(`Banir usuário @${block.user.username} permanentemente?`)) return
        setIsBanning(true)
        const res = await adminBanUser(block.userId, true)
        if (res.success) {
            toast.success(`Usuário @${block.user.username} banido`)
        } else {
            toast.error(res.error || "Erro ao banir usuário.")
        }
        setIsBanning(false)
    }

    if (!isVisible) return null

    return (
        <div className="flex flex-col border border-zinc-900 bg-zinc-950/50 group overflow-hidden transition-all hover:border-zinc-700 hover:bg-zinc-900/20">
            {/* 1. Header: Meta Info */}
            <div className="p-3 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <UserIcon className="w-3.5 h-3.5 text-zinc-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-[11px] font-black uppercase tracking-tight", block.user.isBanned ? "text-red-500/50 line-through" : "text-zinc-200")}>
                                @{block.user.username}
                            </span>
                            {block.user.isBanned && (
                                <span className="text-[7px] font-black bg-red-500/10 text-red-500 border border-red-500/20 px-1 py-0 uppercase tracking-widest">
                                    Isolated
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-[8px] text-zinc-600 uppercase font-mono tracking-tighter">
                            {formatDistanceToNow(new Date(block.createdAt), { addSuffix: true, locale: ptBR })}
                        </div>
                    </div>
                </div>

                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 bg-zinc-900 px-2 py-0.5 border border-zinc-800">
                    {block.type}
                </div>
            </div>

            {/* 2. Content: The real block preview */}
            <div className="relative aspect-square bg-[#050505] flex items-center justify-center p-6 overflow-hidden group/content border-b border-zinc-900">
                <div className="transform scale-[0.65] origin-center transition-transform duration-500 group-hover/content:scale-[0.75]">
                    <div className="w-[300px] h-[300px] flex items-center justify-center overflow-visible pointer-events-none">
                        <BlockRenderer block={block} isPublic />
                    </div>
                </div>

                {/* Overlay for actions on hover */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                    <div className="flex gap-4">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="h-12 w-12 flex items-center justify-center bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
                            title="Excluir Bloco"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        {!block.user.isBanned && (
                            <button
                                onClick={handleBan}
                                disabled={isBanning}
                                className="h-12 w-12 flex items-center justify-center bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                                title="Isolar Usuário"
                            >
                                <UserX className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">Security Protocols</span>
                </div>
            </div>

            {/* 3. Footer: Interaction hints */}
            <div className="p-3 flex items-center justify-between text-[9px] bg-zinc-950/50">
                <span className="text-zinc-700 font-mono tracking-tighter italic">ID: {block.id.slice(0, 12).toUpperCase()}</span>
                <Link
                    href={`/${block.user.username}`}
                    target="_blank"
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors font-black uppercase tracking-widest border-b border-zinc-800 hover:border-white pb-0.5"
                >
                    Manifest View <ExternalLink className="w-2.5 h-2.5" />
                </Link>
            </div>
        </div>
    )
}
