import { ImageResponse } from 'next/og'
import prisma from '@/lib/prisma'

export const runtime = 'edge'

export const alt = 'MoodSpace Profile'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: { username: string } }) {
    const { username } = await params

    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            profile: true
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
    const avatarUrl = user.profile?.avatarUrl

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
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000 100%)',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: 40,
                    left: 40,
                    display: 'flex',
                    fontSize: 20,
                    letterSpacing: '0.4em',
                    fontWeight: 900,
                    color: 'rgba(255,255,255,0.4)',
                }}>
                    MOODSPACE // SYSTEM
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 24,
                }}>
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={name}
                            style={{
                                width: 200,
                                height: 200,
                                borderRadius: 100,
                                border: '4px solid #fff',
                            }}
                        />
                    ) : (
                        <div style={{
                            width: 200,
                            height: 200,
                            borderRadius: 100,
                            backgroundColor: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 80,
                            color: '#fff',
                            border: '4px solid #fff',
                        }}>
                            {username[0].toUpperCase()}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                            style={{
                                fontSize: 64,
                                fontWeight: 900,
                                color: '#fff',
                                textAlign: 'center',
                                marginBottom: 8,
                            }}
                        >
                            {name}
                        </div>
                        <div
                            style={{
                                fontSize: 32,
                                color: 'rgba(255,255,255,0.6)',
                                fontWeight: 400,
                            }}
                        >
                            @{username}
                        </div>
                    </div>
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: 40,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 20px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.2)',
                }}>
                    <div style={{ fontSize: 18, color: '#fff', fontWeight: 600 }}>Create your board</div>
                    <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>— moodproject.vercel.app</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
