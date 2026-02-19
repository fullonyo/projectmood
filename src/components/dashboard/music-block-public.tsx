"use client"

interface MusicBlockPublicProps {
    content: {
        trackId: string
        name?: string
        artist?: string
        albumArt?: string
    }
    isPublic?: boolean
}

export function MusicBlockPublic({ content, isPublic = false }: MusicBlockPublicProps) {
    return (
        <div className="w-full max-w-[320px] p-2 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/10 hover:scale-[1.02] transition-transform relative">
            <iframe
                src={`https://open.spotify.com/embed/track/${content.trackId}?utm_source=generator`}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-2xl"
            />

            {/* Interaction Shield for Editor Mode */}
            {!isPublic && (
                <div className="absolute inset-0 bg-transparent cursor-pointer z-10" />
            )}
        </div>
    )
}
