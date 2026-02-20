"use client"

import { useState, useTransition } from "react"
import { addMoodBlock } from "@/actions/profile"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MessageSquare, Plus, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/context"

export function GuestbookEditor({ highlight }: { highlight?: boolean }) {
    const { t } = useTranslation()
    const [title, setTitle] = useState(t('editors.guestbook.title'))
    const [color, setColor] = useState("#000000")
    const [isPending, startTransition] = useTransition()

    const handleAdd = () => {
        startTransition(async () => {
            await addMoodBlock('guestbook', {
                title,
                color
            }, {
                width: 350,
                height: 400
            })
        })
    }

    return (
        <div className={cn(
            "space-y-6 transition-all duration-500",
            highlight ? "border-2 border-black dark:border-white p-6 -m-6 bg-zinc-50 dark:bg-zinc-900/50" : ""
        )}>
            <div className="flex items-center gap-3">
                <div className="p-2 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <MessageSquare className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('editors.guestbook.title')}</h3>
            </div>

            <div className="space-y-6 border border-zinc-200 dark:border-zinc-800 p-0 bg-white dark:bg-zinc-950">
                <div className="p-5 space-y-4">
                    <div className="space-y-3">
                        <label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.guestbook.label')}</label>
                        <Input
                            placeholder={t('editors.guestbook.placeholder')}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-900 rounded-none h-11 text-[10px] font-mono tracking-tight focus-visible:ring-0 uppercase"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('editors.guestbook.color_label')}</label>
                        <div className="flex gap-2 p-1 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                            <div className="flex-1 relative">
                                <Input
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="bg-zinc-100/50 dark:bg-zinc-800/50 border-none pl-10 h-9 rounded-none text-[9px] font-mono uppercase"
                                />
                                <div
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 border border-white/20"
                                    style={{ backgroundColor: color }}
                                />
                            </div>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-9 h-9 cursor-pointer bg-transparent border-none p-0"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-zinc-100 dark:border-zinc-900">
                    <Button
                        onClick={handleAdd}
                        disabled={isPending}
                        className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-14 font-black uppercase tracking-[0.4em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all border border-black dark:border-white shadow-none"
                    >
                        {t('editors.guestbook.deploy')}
                    </Button>
                </div>
            </div>

            <p className="text-[7px] text-zinc-400 font-black uppercase tracking-widest text-center opacity-30">
                {t('editors.guestbook.visit_active')}
            </p>
        </div>
    )
}
