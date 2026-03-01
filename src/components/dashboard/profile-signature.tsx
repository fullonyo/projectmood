import { cn } from "@/lib/utils"
import { ShieldCheck, Volume2, VolumeX, Lightbulb, LightbulbOff } from "lucide-react"
import { useTranslation } from "@/i18n/context"
import { useAudio } from "./audio-context"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

interface ProfileSignatureProps {
    username: string
    name?: string
    avatarUrl?: string
    isVerified?: boolean
    verificationType?: string | null
    isFocusMode: boolean
    setIsFocusMode: (val: boolean) => void
}

import { VerificationBadge } from "@/components/ui/verification-badge"

export function ProfileSignature({
    username,
    name,
    avatarUrl,
    isVerified = false,
    verificationType,
    isFocusMode,
    setIsFocusMode
}: ProfileSignatureProps) {
    const { t } = useTranslation()
    const { isGlobalMuted, toggleGlobalMute, globalVolume, setGlobalVolume } = useAudio()
    const [showVolumeSlider, setShowVolumeSlider] = useState(false)

    return (
        <header className="fixed top-10 left-10 z-[100] group pointer-events-none">
            <div className="flex items-start gap-5">
                {/* Studio Avatar - High Fashion Style */}
                <div className="relative pointer-events-auto">
                    <div className="w-16 h-16 bg-white dark:bg-zinc-950 overflow-hidden border border-black dark:border-white transition-all duration-500 group-hover:scale-105 rounded-none shadow-2xl">
                        <img
                            src={avatarUrl || `https://avatar.vercel.sh/${username}`}
                            alt={username}
                            className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                        />
                    </div>
                    {/* Active Indicator Restore */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-zinc-950 flex items-center justify-center rounded-none border border-black dark:border-white shadow-none">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-none animate-pulse" />
                    </div>
                </div>

                {/* Studio Credentials & HUD */}
                <div className="flex flex-col pt-1 pointer-events-auto">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] font-black uppercase tracking-[0.5em] opacity-40">{t('public_page.signature.role')}</span>
                        {isVerified && <VerificationBadge isVerified={isVerified} type={verificationType} className="opacity-60" />}
                    </div>

                    <h1 className="text-2xl font-black tracking-tighter leading-none mb-3 mix-blend-difference text-white">
                        {name || username}
                    </h1>

                    {/* HUD Controls Center */}
                    <div className="flex items-center gap-4">
                        {/* Audio Focus Control Group */}
                        <div
                            onMouseEnter={() => setShowVolumeSlider(true)}
                            onMouseLeave={() => setShowVolumeSlider(false)}
                            className="flex items-center bg-black/40 dark:bg-white/5 backdrop-blur-xl p-1 border border-white/10 rounded-none"
                        >
                            <button
                                onClick={toggleGlobalMute}
                                className={cn(
                                    "p-1.5 transition-all duration-300",
                                    isGlobalMuted ? "text-red-500 animate-pulse" : "text-white/40 hover:text-white"
                                )}
                            >
                                {isGlobalMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </button>

                            <AnimatePresence>
                                {showVolumeSlider && !isGlobalMuted && (
                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 80, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        className="h-3 flex items-center px-2 overflow-hidden"
                                    >
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={globalVolume}
                                            onChange={(e) => setGlobalVolume(parseFloat(e.target.value))}
                                            className="w-full h-[2px] appearance-none bg-white/20 accent-white cursor-pointer"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="w-[1px] h-3 bg-white/10 mx-1" />

                            <button
                                onClick={() => setIsFocusMode(!isFocusMode)}
                                className={cn(
                                    "p-1.5 transition-all duration-300",
                                    isFocusMode ? "text-yellow-400" : "text-white/40 hover:text-white"
                                )}
                                title="Focus Mode"
                            >
                                {isFocusMode ? <Lightbulb className="w-3.5 h-3.5" /> : <LightbulbOff className="w-3.5 h-3.5" />}
                            </button>
                        </div>

                        {/* ID Badge Mini */}
                        <div className="flex flex-col opacity-20 hover:opacity-100 transition-opacity duration-700 select-none">
                            <span className="text-[10px] font-bold tracking-tighter italic mix-blend-difference text-white">@{username.toLowerCase()}</span>
                            <span className="text-[7px] font-black uppercase tracking-[0.2em]">{t('public_page.signature.studio')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
