import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        return NextResponse.json({
            isPlaying: true,
            track: {
                name: 'Midnight City',
                artist: 'M83',
                albumArt: 'https://i.scdn.co/image/ab67616d0000b273295874283626117bd81d1203',
                previewUrl: 'https://p.scdn.co/mp3-preview/f4c330df320645c088ef05021e96196f30a905bc?cid=cfe923b2d660439caf2b557b21f31221'
            }
        })
    } catch (error) {
        console.error('Spotify API error:', error)
        return NextResponse.json({ error: 'Failed to fetch now playing' }, { status: 500 })
    }
}
