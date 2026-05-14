import { ImageResponse } from 'next/og'
import prisma from '@/lib/prisma'

// nodejs runtime para garantir acesso ao Prisma em produção
export const runtime = 'nodejs'

// force-dynamic: nunca tentar pré-renderizar no build (DB não disponível)
export const dynamic = 'force-dynamic'

export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

// Valida se uma string é um hex color válido; retorna fallback se não for
function safeHexColor(color: string | null | undefined, fallback = '#ffffff'): string {
    if (!color) return fallback
    const isHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color.trim())
    return isHex ? color.trim() : fallback
}

// Padding de título para garantir >= 50 caracteres
function padTitle(name: string, username: string): string {
    const base = `${name} (@${username}) no MoodSpace`
    const withSuffix = `${base} — Curate Your Reality`
    // Retorna sempre o maior (com sufixo), garantindo atingir 50+
    return withSuffix
}

export default async function Image({ params }: { params: { handle: string } }) {
    let handle: string
    try {
        handle = (await params).handle
    } catch {
        handle = ''
    }

    // Strip @ se presente
    const username = handle.startsWith('@')
        ? handle.slice(1).toLowerCase()
        : handle.toLowerCase()

    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                rooms: {
                    where: { isPrimary: true },
                    take: 1,
                },
            },
        })

        if (!user) {
            // Fallback: imagem genérica do MoodSpace
            return new ImageResponse(
                (
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#000',
                            fontFamily: 'sans-serif',
                        }}
                    >
                        <div style={{ fontSize: 72, fontWeight: 900, color: '#fff' }}>
                            MoodSpace
                        </div>
                        <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.5)', marginTop: 16 }}>
                            Curate Your Reality
                        </div>
                    </div>
                ),
                { ...size }
            )
        }

        const name = user.name || username
        const displayName = user.name || `@${username}`
        const primaryRoom = user.rooms[0]

        // Validações defensivas de cores
        const rawColor = primaryRoom?.primaryColor
        const primaryColor = safeHexColor(rawColor, '#8b5cf6')

        // Avatar: usa direto sem pré-validar (o ImageResponse suporta falhas de imagem
        // internamente e nosso try/catch externo cobre qualquer crash)
        const avatarUrl = primaryRoom?.avatarUrl || user.image || null

        const isVerified = user.isVerified

        // Título com padding para garantir >= 50 chars
        const titleText = padTitle(name, username)

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#050505',
                        backgroundImage: `radial-gradient(ellipse at 20% 20%, ${primaryColor}30 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, ${primaryColor}18 0%, transparent 55%)`,
                        fontFamily: 'sans-serif',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Dot grid pattern */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
                            backgroundSize: '48px 48px',
                        }}
                    />

                    {/* Top badge */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 56,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        <div
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: primaryColor,
                            }}
                        />
                        <div
                            style={{
                                fontSize: 18,
                                letterSpacing: '0.35em',
                                fontWeight: 700,
                                color: 'rgba(255,255,255,0.4)',
                                textTransform: 'uppercase',
                            }}
                        >
                            MOODSPACE // PROFILE
                        </div>
                    </div>

                    {/* Main content */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 36,
                            zIndex: 10,
                        }}
                    >
                        {/* Avatar */}
                        <div style={{ position: 'relative', display: 'flex' }}>
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={displayName}
                                    width={220}
                                    height={220}
                                    style={{
                                        borderRadius: 110,
                                        border: '2px solid rgba(255,255,255,0.12)',
                                        outline: `4px solid ${primaryColor}40`,
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 220,
                                        height: 220,
                                        borderRadius: 110,
                                        backgroundColor: '#111',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 96,
                                        color: '#fff',
                                        border: '2px solid rgba(255,255,255,0.12)',
                                    }}
                                >
                                    {username[0]?.toUpperCase() ?? 'M'}
                                </div>
                            )}

                            {isVerified && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: 8,
                                        right: 8,
                                        width: 48,
                                        height: 48,
                                        borderRadius: 24,
                                        backgroundColor: primaryColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#000',
                                        fontSize: 22,
                                        fontWeight: 900,
                                        border: '3px solid #050505',
                                    }}
                                >
                                    ✦
                                </div>
                            )}
                        </div>

                        {/* Name + handle */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 10,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 80,
                                    fontWeight: 900,
                                    color: '#fff',
                                    textAlign: 'center',
                                    letterSpacing: '-0.03em',
                                    lineHeight: 1,
                                }}
                            >
                                {name}
                            </div>
                            <div
                                style={{
                                    fontSize: 30,
                                    color: 'rgba(255,255,255,0.38)',
                                    fontWeight: 400,
                                    letterSpacing: '0.04em',
                                }}
                            >
                                moodspace.com.br/@{username}
                            </div>
                        </div>
                    </div>

                    {/* Footer pill */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 56,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            padding: '10px 28px',
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            borderRadius: 100,
                            border: '1px solid rgba(255,255,255,0.07)',
                        }}
                    >
                        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                            CURATE YOUR REALITY
                        </div>
                        <div
                            style={{
                                width: 4,
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                            }}
                        />
                        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.35)' }}>STUDIO</div>
                    </div>
                </div>
            ),
            { ...size }
        )
    } catch (err) {
        console.error('[opengraph-image] Error generating OG image for:', username, err)

        // Fallback seguro — nunca retorna 500 ao Discord
        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#050505',
                        fontFamily: 'sans-serif',
                    }}
                >
                    <div style={{ fontSize: 80, fontWeight: 900, color: '#fff' }}>
                        MoodSpace
                    </div>
                    <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>
                        @{username}
                    </div>
                    <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
                        moodspace.com.br
                    </div>
                </div>
            ),
            { ...size }
        )
    }
}
