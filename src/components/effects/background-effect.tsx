"use client"

interface BackgroundEffectProps {
    type: string
}

export function BackgroundEffect({ type }: BackgroundEffectProps) {
    if (!type || type === 'none') return null

    return (
        <div className="fixed inset-0 pointer-events-none -z-[1] overflow-hidden">
            {type === 'noise' && (
                <div className="absolute inset-0 opacity-[0.03] z-0 mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                    }}
                />
            )}

            {type === 'aurora' && (
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-aurora opacity-50 blur-[100px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mix-blend-multiply filter" />
                    <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] animate-aurora-rev opacity-50 blur-[100px] bg-gradient-to-l from-indigo-500 via-teal-500 to-emerald-500 rounded-full mix-blend-multiply filter" style={{ animationDelay: '2s' }} />
                </div>
            )}

            {type === 'grid-move' && (
                <div className="absolute inset-0 z-0 perspective-[500px]">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] animate-grid-flow" />
                </div>
            )}

            {type === 'stars' && (
                <div className="absolute inset-0 z-0 bg-black">
                    <div className="stars-layer-1 absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 animate-pulse" />
                </div>
            )}

            <style jsx global>{`
                @keyframes aurora {
                    0% { transform: rotate(0deg) translate(0, 0); }
                    50% { transform: rotate(180deg) translate(100px, 50px); }
                    100% { transform: rotate(360deg) translate(0, 0); }
                }
                @keyframes aurora-rev {
                    0% { transform: rotate(360deg) translate(0, 0); }
                    50% { transform: rotate(180deg) translate(-100px, -50px); }
                    100% { transform: rotate(0deg) translate(0, 0); }
                }
                .animate-aurora { animation: aurora 20s linear infinite; }
                .animate-aurora-rev { animation: aurora-rev 25s linear infinite; }
                
                @keyframes grid-flow {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(40px); }
                }
                .animate-grid-flow {
                    animation: grid-flow 2s linear infinite;
                }
            `}</style>
        </div>
    )
}
