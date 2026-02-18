"use client"

import { MoodStatusBlockContent } from "@/lib/validations"

interface MoodStatusBlockPublicProps {
    content: MoodStatusBlockContent
}

export function MoodStatusBlockPublic({ content }: MoodStatusBlockPublicProps) {
    const { emoji, text } = content

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-3xl p-8 shadow-xl border border-zinc-200 dark:border-zinc-700">
                <div className="text-center space-y-4">
                    <div className="text-7xl animate-bounce">
                        {emoji}
                    </div>
                    <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
                        {text}
                    </p>
                </div>
            </div>
        </div>
    )
}
