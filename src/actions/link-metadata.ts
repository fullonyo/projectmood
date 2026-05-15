"use server"

export async function fetchLinkMetadata(url: string) {
    try {
        if (!url.startsWith('http')) return { error: "Invalid URL" }
        
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MoodSpaceBot/1.0)' },
            next: { revalidate: 3600 }
        })
        
        if (!response.ok) return { error: "Failed to fetch" }

        const html = await response.text()
        
        // Extract title using regex
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        let title = titleMatch ? titleMatch[1].trim() : ''
        
        // Clean up title (remove common suffixes like "- YouTube" or "| SiteName")
        if (title.includes(' - ')) title = title.split(' - ')[0]
        if (title.includes(' | ')) title = title.split(' | ')[0]
        
        return { title, success: true }
    } catch (e) {
        return { error: "Fetch failed" }
    }
}
