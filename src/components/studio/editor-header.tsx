import { Activity } from "lucide-react"

/**
 * EditorHeader — Header padronizado para editores de blocos.
 *
 * Substitui ~10 instâncias inline de:
 * ```tsx
 * <header className="flex items-center gap-2 opacity-30 px-1">
 *     <Activity className="w-2.5 h-2.5 text-black dark:text-white" />
 *     <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em]">{title}</h3>
 * </header>
 * ```
 */

interface EditorHeaderProps {
    /** Título exibido no header */
    title: string
    /** Ícone customizado (default: Activity) */
    icon?: React.ElementType
    /** Classes CSS adicionais no container */
    className?: string
}

export function EditorHeader({ title, icon: Icon = Activity, className }: EditorHeaderProps) {
    return (
        <header className={`flex items-center gap-2 opacity-30 px-1 ${className || ''}`}>
            <Icon className="w-2.5 h-2.5 text-black dark:text-white" />
            <h3 className="text-[7.5px] font-black uppercase tracking-[0.4em]">{title}</h3>
        </header>
    )
}
