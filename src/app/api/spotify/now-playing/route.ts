import { NextRequest, NextResponse } from 'next/server'

// Mock implementation - In production, this would use Spotify OAuth
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        // Mock response com MÚSICA DE DEMONSTRAÇÃO (Lo-fi Beat)
        // Isso permite testar o player sem precisar configurar OAuth agora.
        return NextResponse.json({
            isPlaying: true,
            track: {
                name: 'Midnight City',
                artist: 'M83',
                albumArt: 'https://i.scdn.co/image/ab67616d0000b273295874283626117bd81d1203',
                // Link oficial de preview do Spotify (pode expirar, mas serve para demo)
                // Se falhar, usar link genérico de MP3
                previewUrl: 'https://p.scdn.co/mp3-preview/f4c330df320645c088ef05021e96196f30a905bc?cid=cfe923b2d660439caf2b557b21f31221'
            }
        })
    } catch (error) {
        console.error('Spotify API error:', error)
        return NextResponse.json({ error: 'Failed to fetch now playing' }, { status: 500 })
    }
}
