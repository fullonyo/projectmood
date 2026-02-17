import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { Instagram, Twitter, Github, Linkedin, Youtube, MessageSquare, Link as LinkIcon } from "lucide-react";
import { DiscordIcon, TikTokIcon, SpotifyIcon, TwitchIcon, PinterestIcon, SteamIcon } from "@/components/icons";
import { motion } from "framer-motion";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ICONS: Record<string, any> = {
    instagram: Instagram,
    twitter: Twitter,
    discord: DiscordIcon,
    tiktok: TikTokIcon,
    steam: SteamIcon,
    spotify: SpotifyIcon,
    twitch: TwitchIcon,
    pinterest: PinterestIcon,
    github: Github,
    linkedin: Linkedin,
    youtube: Youtube,
    custom: LinkIcon
}

type Props = {
    params: Promise<{ username: string }>;
};

export async function generateMetadata({
    params,
}: Props): Promise<Metadata> {
    const { username } = await params;

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) return { title: "Usuário não encontrado | MOOD" };

    return {
        title: `${user.name || user.username} (@${user.username}) | MOOD`,
        description: `Confira o espaço criativo de @${user.username}. Aesthetic moods, music & GIFs.`,
    };
}

export default async function PublicMoodPage({
    params,
}: Props) {
    const { username } = await params;

    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            profile: true,
            moodBlocks: { orderBy: { order: "asc" } },
        },
    });

    if (!user || !user.profile) notFound();

    const { profile, moodBlocks } = user;

    const theme = profile.theme || 'light';
    const themeConfigs: Record<string, { bg: string, primary: string, grid: string, bgSize: string, gridOpacity: string }> = {
        light: {
            bg: profile.backgroundColor || '#fafafa',
            primary: profile.primaryColor || '#18181b',
            grid: 'radial-gradient(currentColor 1px, transparent 1px)',
            bgSize: '40px 40px',
            gridOpacity: 'opacity-[0.03] dark:opacity-[0.08]'
        },
        dark: {
            bg: '#050505',
            primary: '#ffffff',
            grid: 'radial-gradient(currentColor 1px, transparent 1px)',
            bgSize: '40px 40px',
            gridOpacity: 'opacity-[0.08]'
        },
        vintage: {
            bg: '#f4ead5',
            primary: '#5d4037',
            grid: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
            bgSize: '200px 200px',
            gridOpacity: 'opacity-25'
        },
        notebook: {
            bg: '#ffffff',
            primary: '#1e3a8a',
            grid: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, transparent 79px, #fca5a5 1px, #fca5a5 2px, transparent 81px)',
            bgSize: '100% 30px',
            gridOpacity: 'opacity-100'
        },
        blueprint: {
            bg: '#1a3a5f',
            primary: '#ffffff',
            grid: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            bgSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
            gridOpacity: 'opacity-100'
        },
        canvas: {
            bg: '#e7e5e4',
            primary: '#44403c',
            grid: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20L0 20z\' fill=\'%23000\' fill-opacity=\'.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            bgSize: '40px 40px',
            gridOpacity: 'opacity-100'
        },
        cyberpunk: {
            bg: '#000000',
            primary: '#ff00ff',
            grid: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px), linear-gradient(0deg, rgba(255,0,255,0.03) 50%, transparent 50%)',
            bgSize: '40px 40px, 40px 40px, 100% 4px',
            gridOpacity: 'opacity-100'
        }
    };

    const config = themeConfigs[theme] || themeConfigs.light;

    return (
        <div
            className={cn(
                "h-screen w-full relative overflow-hidden transition-all duration-1000",
                profile.fontStyle === 'serif' ? 'font-serif' : profile.fontStyle === 'mono' ? 'font-mono' : 'font-sans'
            )}
            style={{
                backgroundColor: config.bg,
                color: config.primary
            }}
        >
            {/* Dynamic Background Effect */}
            <div
                className={cn("fixed inset-0 pointer-events-none transition-opacity duration-1000", config.gridOpacity)}
                style={{
                    backgroundImage: config.grid,
                    backgroundSize: config.bgSize,
                    filter: theme === 'vintage' ? 'contrast(110%) brightness(105%) sepia(20%)' : 'none'
                }}
            />

            {/* Floating Header */}
            <header className="fixed top-8 left-8 z-50 mix-blend-difference">
                <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-current">
                        <img src={`https://avatar.vercel.sh/${user.username}`} alt={user.username} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter">@{user.username}</h1>
                        <p className="text-[10px] uppercase tracking-widest opacity-60">Mood.Canvas</p>
                    </div>
                </div>
            </header>

            {/* The Canvas Reality */}
            <main className="relative w-full h-full">
                {moodBlocks.map((block: any) => {
                    const stableHash = (str: string) => {
                        let hash = 0;
                        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
                        return Math.abs(hash);
                    };

                    const hash = stableHash(block.id);
                    const displayX = block.x > 100 ? (20 + (hash % 60)) : block.x
                    const displayY = block.y > 100 ? (20 + (hash % 60)) : block.y

                    return (
                        <div
                            key={block.id}
                            className="absolute select-none pointer-events-auto"
                            style={{
                                left: `${displayX}%`,
                                top: `${displayY}%`,
                                transform: `rotate(${block.rotation || 0}deg)`,
                                zIndex: block.zIndex || 1
                            }}
                        >
                            {block.type === 'text' && (
                                <div
                                    className={cn(
                                        "p-6 shadow-2xl transition-all duration-300 min-w-[220px] max-w-[450px]",
                                        (block.content as any).style === 'postit' && "bg-[#ffff88] text-zinc-900 rotate-[-1deg] shadow-yellow-900/20 rounded-sm border-b-[20px] border-b-black/5",
                                        (block.content as any).style === 'ripped' && "bg-white text-zinc-900 shadow-zinc-300/80",
                                        (block.content as any).style === 'typewriter' && "bg-transparent border-2 border-dashed border-current rounded-none",
                                        (block.content as any).style === 'simple' && "bg-white/10 dark:bg-zinc-900/10 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl"
                                    )}
                                    style={{
                                        backgroundColor: (block.content as any).bgColor,
                                        clipPath: (block.content as any).style === 'ripped' ? 'polygon(0% 2%, 98% 0%, 100% 100%, 2% 98%, 0% 50%)' : 'none',
                                        textAlign: (block.content as any).align as any || 'center'
                                    }}
                                >
                                    <p className={cn(
                                        "leading-relaxed transition-all",
                                        (block.content as any).fontSize === 'sm' && "text-base",
                                        (block.content as any).fontSize === 'xl' && "text-3xl font-serif italic",
                                        (block.content as any).fontSize === '3xl' && "text-5xl font-black tracking-tighter font-mono uppercase",
                                        (block.content as any).style === 'typewriter' && "font-mono underline decoration-dotted"
                                    )}>
                                        {(block.content as any).text}
                                    </p>
                                </div>
                            )}

                            {block.type === 'gif' && (
                                <div className="p-1 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/10">
                                    <img src={(block.content as any).url} alt="gif" className="rounded-xl w-48 h-auto" />
                                </div>
                            )}

                            {block.type === 'tape' && (
                                <div
                                    className="w-32 h-8 shadow-sm backdrop-blur-[2px]"
                                    style={{
                                        backgroundColor: (block.content as any).color,
                                        backgroundImage: (block.content as any).pattern === 'dots' ? 'radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)' : 'none',
                                        backgroundSize: '4px 4px',
                                        clipPath: 'polygon(2% 0%, 98% 2%, 100% 100%, 0% 98%)'
                                    }}
                                />
                            )}

                            {block.type === 'weather' && (
                                <div className="p-6 bg-white/10 dark:bg-zinc-900/10 backdrop-blur-3xl border border-white/10 rounded-sm shadow-sm min-w-[180px] text-center space-y-2">
                                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">Current Mood</p>
                                    <p className="text-xl font-serif italic">{(block.content as any).vibe}</p>
                                    <div className="h-[1px] w-6 bg-current mx-auto opacity-10" />
                                    <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest">{(block.content as any).location}</p>
                                </div>
                            )}

                            {block.type === 'media' && (
                                <div className={cn(
                                    "p-4 py-8 min-w-[140px] max-w-[200px] shadow-2xl relative transition-transform",
                                    (block.content as any).category === 'book' ? "bg-[#f5f5dc] text-zinc-900 rounded-r-md border-l-[6px] border-zinc-400" : "bg-black text-white rounded-md border-2 border-zinc-800"
                                )}>
                                    <div className="absolute top-2 left-3 text-[8px] opacity-30 uppercase font-black">
                                        {(block.content as any).category}
                                    </div>
                                    <p className="text-sm font-black text-center mt-2 leading-tight uppercase font-mono tracking-tighter">
                                        {(block.content as any).title}
                                    </p>
                                    <div className="mt-6 pt-6 border-t border-zinc-500/10 text-[10px] italic text-center opacity-60">
                                        {(block.content as any).review}
                                    </div>
                                </div>
                            )}

                            {block.type === 'doodle' && (
                                <img
                                    src={(block.content as any).image}
                                    alt="doodle"
                                    className="w-48 h-auto dark:invert contrast-125 brightness-110 pointer-events-none"
                                />
                            )}

                            {block.type === 'social' && (
                                <a
                                    href={(block.content as any).url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block transition-transform hover:scale-110 active:scale-95 group/social"
                                >
                                    <SocialBlockPublic content={block.content} />
                                </a>
                            )}

                            {block.type === 'music' && (
                                <div className="w-80 p-2 bg-zinc-950 rounded-[2rem] shadow-2xl overflow-hidden border border-white/10">
                                    <iframe
                                        src={`https://open.spotify.com/embed/track/${(block.content as any).trackId}`}
                                        width="100%" height="80" frameBorder="0" allow="encrypted-media"
                                        className="rounded-2xl pointer-events-none opacity-90"
                                    />
                                </div>
                            )}
                            {block.type === 'ticker' && (
                                <div
                                    className={cn(
                                        "py-3 overflow-hidden whitespace-nowrap shadow-2xl min-w-[300px] transition-all duration-500",
                                        (block.content as any).style === 'neon' && "border-y border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]",
                                        (block.content as any).style === 'glass' && "backdrop-blur-md border-y border-white/10"
                                    )}
                                    style={{ backgroundColor: (block.content as any).bgColor }}
                                >
                                    <motion.div
                                        animate={{
                                            x: (block.content as any).direction === 'right' ? ["-50%", "0%"] : ["0%", "-50%"]
                                        }}
                                        transition={{
                                            duration: (block.content as any).speed || 20,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                        className="inline-block"
                                    >
                                        <span
                                            className={cn(
                                                "text-sm font-black uppercase tracking-[0.2em] px-4",
                                                (block.content as any).style === 'neon' && "animate-pulse"
                                            )}
                                            style={{ color: (block.content as any).textColor }}
                                        >
                                            {(block.content as any).text} • {(block.content as any).text} • {(block.content as any).text} • {(block.content as any).text} •
                                        </span>
                                    </motion.div>
                                </div>
                            )}

                            {block.type === 'subtitle' && (
                                <div className="p-6 max-w-[450px]">
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        variants={{
                                            hidden: { opacity: 1 },
                                            visible: {
                                                opacity: 1,
                                                transition: {
                                                    staggerChildren: (block.content as any).speed || 0.05,
                                                }
                                            }
                                        }}
                                        className={cn(
                                            "px-10 py-6 shadow-2xl relative overflow-hidden transition-all duration-500",
                                            (block.content as any).style === 'vhs' && "bg-[#050505] border-l-[8px] border-l-red-600 rounded-sm shadow-[8px_8px_0_rgba(0,0,0,0.5)]",
                                            (block.content as any).style === 'minimal' && "bg-transparent border-none rounded-none text-xl font-normal tracking-tight",
                                            (block.content as any).style === 'modern' && "bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800"
                                        )}
                                        style={{
                                            backgroundColor: (block.content as any).style !== 'minimal' ? (block.content as any).bgColor : 'transparent',
                                        }}
                                    >
                                        <p
                                            className={cn(
                                                "text-center leading-relaxed whitespace-pre-wrap",
                                                (block.content as any).style === 'vhs' && "font-mono font-bold italic tracking-tighter uppercase",
                                                (block.content as any).style === 'minimal' && "font-serif italic",
                                                (block.content as any).style === 'modern' && "font-sans font-medium"
                                            )}
                                            style={{ color: (block.content as any).textColor }}
                                        >
                                            {(block.content as any).text.split("").map((char: string, i: number) => (
                                                <motion.span
                                                    key={i}
                                                    variants={{
                                                        hidden: { opacity: 0, display: 'none' },
                                                        visible: { opacity: 1, display: 'inline' }
                                                    }}
                                                >
                                                    {char}
                                                </motion.span>
                                            ))}
                                            <motion.span
                                                animate={{ opacity: [1, 0] }}
                                                transition={{ duration: 0.8, repeat: Infinity }}
                                                className={cn(
                                                    "inline-block ml-1 h-[1.2em] align-middle",
                                                    (block.content as any).cursorType === 'block' && "w-[0.5em] bg-current",
                                                    (block.content as any).cursorType === 'bar' && "w-[2px] bg-current",
                                                    (block.content as any).cursorType === 'underline' && "w-[0.6em] h-[2px] mt-[1em] bg-current"
                                                )}
                                            />
                                        </p>

                                        {(block.content as any).style === 'vhs' && (
                                            <div className="absolute top-2 right-4 flex gap-1 opacity-50">
                                                <div className="w-1 h-3 bg-red-500 animate-[pulse_0.5s_infinite]" />
                                                <span className="text-[8px] font-mono text-white">PLAY</span>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            )}

                            {block.type === 'floating' && (
                                <div className="p-10 select-none">
                                    <motion.div
                                        animate={
                                            (block.content as any).style === 'ghost'
                                                ? { opacity: [0.3, 0.6, 0.3], scale: [0.98, 1, 0.98] }
                                                : { y: [-10, 10] }
                                        }
                                        transition={{
                                            duration: (block.content as any).speed || 3,
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            ease: "easeInOut"
                                        }}
                                        className="relative flex items-center justify-center min-w-[200px]"
                                    >
                                        <p
                                            className={cn(
                                                "text-center text-4xl font-light tracking-tight transition-all duration-1000",
                                                (block.content as any).style === 'focus' && "blur-[8px] animate-[focus_2s_forwards]",
                                                (block.content as any).style === 'clean' && "font-serif italic",
                                                (block.content as any).style === 'ghost' && "font-mono font-bold tracking-tighter"
                                            )}
                                            style={{ color: (block.content as any).textColor }}
                                        >
                                            {(block.content as any).text}
                                        </p>

                                        <style jsx>{`
                                            @keyframes focus {
                                                to { filter: blur(0px); opacity: 1; }
                                            }
                                        `}</style>
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </main>

            {/* Branding Footer */}
            <footer className="fixed bottom-8 right-8 z-50">
                <div className="text-[9px] font-black tracking-[0.5em] uppercase opacity-20 hover:opacity-100 transition-opacity">
                    Personal Scrapbook
                </div>
            </footer>
        </div>
    );
}

function SocialBlockPublic({ content }: { content: any }) {
    const Icon = ICONS[content.platform] || LinkIcon
    const { style, label } = content

    return (
        <div className={cn(
            "flex items-center gap-3 px-4 py-2.5 transition-all duration-300 shadow-xl",
            style === 'tag' && "bg-[#fefefe] dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-[2px] border border-zinc-200 dark:border-zinc-700 border-l-[6px] border-l-black dark:border-l-white",
            style === 'glass' && "bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-2xl border border-white/20 text-current group-hover/social:bg-white/20",
            style === 'minimal' && "bg-transparent text-current font-black tracking-tighter text-xl",
            style === 'neon' && "bg-black text-green-400 rounded-full border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)] group-hover/social:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
        )}>
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                style === 'minimal' ? "bg-black text-white dark:bg-white dark:text-black shadow-lg" : "bg-zinc-100 dark:bg-zinc-700/50"
            )}>
                <Icon className="w-4 h-4" />
            </div>
            <span className={cn(
                "text-sm font-bold",
                style === 'tag' && "font-serif italic",
                style === 'minimal' && "uppercase tracking-[0.3em] text-[10px]"
            )}>
                {label}
            </span>
        </div>
    )
}
