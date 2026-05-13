"use server"

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function searchUnsplash(query: string) {
    try {
        if (!UNSPLASH_ACCESS_KEY) {
            console.warn("UNSPLASH_ACCESS_KEY not found in .env. Using mock results.");
            const mocks = [
                { id: 'm1', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', alt: 'Landscape' },
                { id: 'm2', url: 'https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb', alt: 'Architecture' },
                { id: 'm3', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05', alt: 'Nature' },
                { id: 'm4', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', alt: 'Forest' },
                { id: 'm5', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', alt: 'Lake' },
                { id: 'm6', url: 'https://images.unsplash.com/photo-1433086566608-57a4e8e531ad', alt: 'Waterfall' }
            ];
            
            const filtered = mocks.filter(m => 
                m.alt.toLowerCase().includes(query.toLowerCase()) || query.length > 3
            ).slice(0, 4);

            return {
                success: true,
                isMock: true,
                photos: filtered.length > 0 ? filtered : mocks.slice(0, 4)
            };
        }

        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20`,
            {
                headers: {
                    Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                },
                next: { revalidate: 3600 }
            }
        );

        if (!response.ok) throw new Error("Unsplash API failure");

        const data = await response.json();
        return {
            success: true,
            photos: data.results.map((img: any) => ({
                id: img.id,
                url: img.urls.regular,
                alt: img.alt_description || "Unsplash Photo",
                user: img.user.name
            }))
        };
    } catch (error) {
        console.error("[searchUnsplash] Error:", error);
        return { success: false, error: "Falha na busca" };
    }
}
