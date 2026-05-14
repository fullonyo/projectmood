import { ImageResponse } from 'next/og'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: { handle: string } }) {
    const { handle } = await params
    
    // Strip @ if present
    const username = handle.startsWith('@') ? handle.slice(1).toLowerCase() : handle.toLowerCase()

    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            rooms: {
                where: { isPrimary: true },
                take: 1
            }
        }
    })

    if (!user) {
        return new ImageResponse(
            (
                <div
                    style={{
                        fontSize: 48,
                        background: 'white',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'sans-serif',
                    }}
                >
                    MoodSpace
                </div>
            ),
            {
                ...size,
            }
        )
    }

    const name = user.name || user.username
    const primaryRoom = user.rooms[0]
    const avatarUrl = primaryRoom?.avatarUrl || user.image
    const primaryColor = primaryRoom?.primaryColor || '#ffffff'
    const isVerified = user.isVerified

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
                    backgroundImage: `radial-gradient(circle at 0% 0%, ${primaryColor}22 0%, transparent 50%), radial-gradient(circle at 100% 100%, ${primaryColor}11 0%, transparent 50%)`,
                    fontFamily: 'sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.03,
                    backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />

                {/* Top Label */}
                <div style={{
                    position: 'absolute',
                    top: 60,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                }}>
                    <div style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: primaryColor,
                        boxShadow: `0 0 10px ${primaryColor}`,
                    }} />
                    <div style={{
                        fontSize: 20,
                        letterSpacing: '0.4em',
                        fontWeight: 900,
                        color: 'rgba(255,255,255,0.5)',
                        textTransform: 'uppercase',
                    }}>
                        MoodSpace // Profile
                    </div>
                </div>

                {/* Main Content */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 40,
                    zIndex: 10,
                }}>
                    <div style={{ position: 'relative', display: 'flex' }}>
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={name || "User Avatar"}
                                style={{
                                    width: 240,
                                    height: 240,
                                    borderRadius: 120,
                                    border: `1px solid rgba(255,255,255,0.1)`,
                                    padding: 8,
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                }}
                            />
                        ) : (
                            <div style={{
                                width: 240,
                                height: 240,
                                borderRadius: 120,
                                backgroundColor: '#111',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 100,
                                color: '#fff',
                                border: `1px solid rgba(255,255,255,0.1)`,
                            }}>
                                {username[0].toUpperCase()}
                            </div>
                        )}
                        
                        {isVerified && (
                            <div style={{
                                position: 'absolute',
                                bottom: 10,
                                right: 10,
                                width: 50,
                                height: 50,
                                borderRadius: 25,
                                backgroundColor: primaryColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#000',
                                fontSize: 24,
                                fontWeight: 900,
                                border: '4px solid #000',
                            }}>
                                ✦
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div
                            style={{
                                fontSize: 84,
                                fontWeight: 900,
                                color: '#fff',
                                textAlign: 'center',
                                letterSpacing: '-0.02em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                            }}
                        >
                            {name}
                        </div>
                        <div
                            style={{
                                fontSize: 32,
                                color: 'rgba(255,255,255,0.4)',
                                fontWeight: 500,
                                letterSpacing: '0.05em',
                            }}
                        >
                            moodspace.com.br/@{username}
                        </div>
                    </div>
                </div>

                {/* Footer Branding */}
                <div style={{
                    position: 'absolute',
                    bottom: 60,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '12px 32px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: 100,
                    border: '1px solid rgba(255,255,255,0.08)',
                }}>
                    <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>CURATE YOUR REALITY</div>
                    <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)' }}>STUDIO</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
