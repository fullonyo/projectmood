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
        <div className="flex flex-col border border-zinc-900 bg-[#0a0a0a] group overflow-hidden transition-all hover:border-zinc-700">
            {/* 1. Header: Meta Info */}
            <div className="p-3 border-b border-zinc-900 bg-zinc-950/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-xs font-black", block.user.isBanned ? "text-red-500 line-through" : "text-zinc-200")}>
                                @{block.user.username}
                            </span>
                            {block.user.isBanned && (
                                <Badge className="h-3 text-[7px] bg-red-900/20 text-red-500 border-red-500/20 px-1 py-0 rounded-none leading-none">
                                    BANNED
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-zinc-500 uppercase font-mono">
                            <Calendar className="w-2.5 h-2.5" />
                            {formatDistanceToNow(new Date(block.createdAt), { addSuffix: true, locale: ptBR })}
                        </div>
                    </div>
                </div>

                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 bg-zinc-900 px-2 py-0.5 border border-zinc-800">
                    {block.type}
                </div>
            </div>

            {/* 2. Content: The real block preview */}
            <div className="relative aspect-video bg-zinc-950 flex items-center justify-center p-4 overflow-hidden group/content">
                <div className="transform scale-[0.6] origin-center transition-transform group-hover/content:scale-[0.7]">
                    <div className="w-[300px] h-[300px] flex items-center justify-center overflow-auto pointer-events-none">
                        <BlockRenderer block={block} isPublic />
                    </div>
                </div>

                {/* Overlay for actions on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-3 bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
                        title="Excluir Bloco"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    {!block.user.isBanned && (
                        <button
                            onClick={handleBan}
                            disabled={isBanning}
                            className="p-3 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                            title="Banir Usuário"
                        >
                            <UserX className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* 3. Footer: Interaction hints */}
            <div className="p-3 flex items-center justify-between text-[10px] bg-zinc-950/30">
                <span className="text-zinc-600 font-mono">ID: {block.id.slice(0, 8)}...</span>
                <Link
                    href={`/${block.user.username}`}
                    target="_blank"
                    className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors font-black uppercase tracking-tighter"
                >
                    Full Profile <ExternalLink className="w-3 h-3" />
                </Link>
            </div>
        </div>
    )
}
