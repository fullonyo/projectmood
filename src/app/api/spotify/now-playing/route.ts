import { NextRequest, NextResponse } from 'next/server'

// Mock implementation - In production, this would use Spotify OAuth
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        // TODO: Implement real Spotify OAuth flow
        // For now, return mock data structure

        // Check if user has connected Spotify (would be in database)
        // const spotifyAuth = await prisma.spotifyAuth.findUnique({ where: { userId } })
        // if (!spotifyAuth) return NextResponse.json({ isPlaying: false })

        // Fetch from Spotify API with access token
        // const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        //     headers: { 'Authorization': `Bearer ${spotifyAuth.accessToken}` }
        // })

        // Mock response for demonstration
        return NextResponse.json({
            isPlaying: false, // Change to true when OAuth is implemented
            track: null
            // When implemented:
            // track: {
            //     name: 'Song Name',
            //     artist: 'Artist Name',
            //     albumArt: 'https://...',
            //     spotifyUrl: 'https://open.spotify.com/track/...'
            // }
        })
    } catch (error) {
        console.error('Spotify API error:', error)
        return NextResponse.json({ error: 'Failed to fetch now playing' }, { status: 500 })
    }
}
