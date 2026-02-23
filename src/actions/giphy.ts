"use server"

export async function searchGifs(query: string) {
    const GIPHY_API_KEY = process.env.GIPHY_API_KEY || 'dc6zaTOxFJmzC'; // API Key pública limitada para dev

    try {
        const response = await fetch(
            `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=g`
        );
        const data = await response.json();


        if (data.meta?.status !== 200) {
            console.error("Giphy API Status Error:", data.meta);
        }

        return data.data.map((gif: any) => ({
            id: gif.id,
            url: gif.images.fixed_height.url,
            title: gif.title,
            width: gif.images.fixed_height.width,
            height: gif.images.fixed_height.height
        }));
    } catch (error) {
        console.error("Giphy API Error:", error);
        return [];
    }
}

export async function getTrendingGifs() {
    const GIPHY_API_KEY = process.env.GIPHY_API_KEY || 'dc6zaTOxFJmzC';

    try {
        const response = await fetch(
            `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`
        );
        const data = await response.json();

        return data.data.map((gif: any) => ({
            id: gif.id,
            url: gif.images.fixed_height.url,
            title: gif.title,
            width: gif.images.fixed_height.width,
            height: gif.images.fixed_height.height
        }));
    } catch (error) {
        return [];
    }
}
