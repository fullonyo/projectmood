import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { Metadata } from "next";

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
        description: `Confira o espaço de @${user.username}. Aesthetic moods, music & more.`,
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

    return (
        <div
            className={cn(
                "min-h-screen flex flex-col items-center pt-24 px-6 pb-20 space-y-12 transition-all duration-1000",
                profile.theme === "dark" ? "bg-[#050505] text-white" : "bg-[#fafafa] text-zinc-900",
                profile.fontStyle === 'serif' ? 'font-serif' : profile.fontStyle === 'mono' ? 'font-mono' : 'font-sans'
            )}
            style={{
                backgroundColor: profile.theme === 'light' ? (profile.backgroundColor || '#fafafa') : '#050505',
                color: profile.primaryColor || (profile.theme === 'dark' ? '#fff' : '#18181b')
            }}
        >
            {/* Tumblr-style Header */}
            <header className="flex flex-col items-center space-y-6 max-w-2xl w-full">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-zinc-200 to-zinc-400 dark:from-zinc-800 dark:to-zinc-500 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-1000"></div>
                    <div className="relative w-40 h-40 rounded-full border-2 border-white/20 dark:border-zinc-800 shadow-2xl overflow-hidden bg-zinc-100">
                        <img
                            src={`https://avatar.vercel.sh/${user.username}`}
                            alt={user.username}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-black tracking-tightest leading-none bg-clip-text text-transparent bg-gradient-to-b from-current to-zinc-500/50"
                        style={{ color: profile.primaryColor || 'inherit' }}>
                        @{user.username}
                    </h1>
                    {user.name && (
                        <p className="text-xl font-medium tracking-tight opacity-40 italic">
                            — {user.name}
                        </p>
                    )}
                </div>
            </header>

            {/* Aesthetic Feed Layout */}
            <main className="w-full max-w-2xl space-y-8">
                {moodBlocks.length === 0 && (
                    <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] opacity-20">
                        <p className="font-serif italic text-2xl">This space is currently silent...</p>
                    </div>
                )}

                {moodBlocks.map((block: any) => (
                    <article
                        key={block.id}
                        className="group relative p-8 rounded-[3.5rem] bg-zinc-50/50 dark:bg-zinc-900/30 backdrop-blur-3xl border border-zinc-100/50 dark:border-white/5 shadow-xl transition-all duration-500 hover:scale-[1.01]"
                    >
                        {block.id && (
                            <div className="hidden">Debug ID: {block.id}</div>
                        )}

                        {block.type === 'text' && (
                            <p className="text-2xl font-serif italic leading-relaxed tracking-tight text-center sm:text-left">
                                “{(block.content as any).text}”
                            </p>
                        )}

                        {block.type === 'music' && (
                            <div className="w-full rounded-3xl overflow-hidden shadow-lg transform transition-transform group-hover:rotate-1">
                                <iframe
                                    src={`https://open.spotify.com/embed/track/${(block.content as any).trackId}`}
                                    width="100%" height="152" frameBorder="0" allow="encrypted-media"
                                    className="rounded-3xl border-none"
                                    title="Spotify"
                                />
                            </div>
                        )}

                        {block.type === 'image' && (
                            <img src={(block.content as any).url} className="rounded-[2.5rem] w-full" alt="mood" />
                        )}
                    </article>
                ))}
            </main>

            {/* Minimal Footer */}
            <footer className="pt-32">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-[1px] bg-zinc-500/20" />
                    <div className="text-[11px] font-black tracking-[0.4em] uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">
                        MOOD·SPACE
                    </div>
                </div>
            </footer>
        </div>
    );
}
