"use server"

const CONDITION_MAP: Record<string, 'sun' | 'rain' | 'snow' | 'wind' | 'cloud'> = {
    'Clear': 'sun',
    'Sunny': 'sun',
    'Partly cloudy': 'cloud',
    'Cloudy': 'cloud',
    'Overcast': 'cloud',
    'Mist': 'cloud',
    'Patchy rain': 'rain',
    'Patchy light rain': 'rain',
    'Light rain': 'rain',
    'Moderate rain': 'rain',
    'Heavy rain': 'rain',
    'Showers': 'rain',
    'Patchy snow': 'snow',
    'Light snow': 'snow',
    'Moderate snow': 'snow',
    'Heavy snow': 'snow',
    'Blizzard': 'snow',
    'Fog': 'cloud',
    'Drizzle': 'rain',
    'Thunder': 'rain',
};

function mapConditionToIcon(desc: string): 'sun' | 'rain' | 'snow' | 'wind' | 'cloud' {
    const d = desc.toLowerCase();
    if (d.includes('sun') || d.includes('clear')) return 'sun';
    if (d.includes('rain') || d.includes('drizzle') || d.includes('shower') || d.includes('thunder')) return 'rain';
    if (d.includes('snow') || d.includes('ice') || d.includes('sleet') || d.includes('hail')) return 'snow';
    if (d.includes('wind') || d.includes('storm')) return 'wind';
    return 'cloud';
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 500) {
    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        try {
            const res = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeout);
            return res;
        } catch (err: any) {
            clearTimeout(timeout);
            const isLastRetry = i === retries - 1;

            if (err.name === 'AbortError') {
                console.warn(`Weather Fetch Timeout (Tentativa ${i + 1}/${retries})`);
            } else {
                console.warn(`Weather Fetch Error: ${err.message} (Tentativa ${i + 1}/${retries})`);
            }

            if (isLastRetry) throw err;

            await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i)));
        }
    }
    throw new Error("Failed to fetch after retries");
}

export async function getWeatherAction(location: string = "") {
    try {
        const query = location ? encodeURIComponent(location) : "";
        const url = `https://wttr.in/${query}?format=j1`;

        const res = await fetchWithRetry(url, {
            next: { revalidate: 3600 }
        });

        if (!res.ok) {
            throw new Error(`Weather service returned status ${res.status}`);
        }

        const data = await res.json();

        if (!data.current_condition || !data.nearest_area) {
            throw new Error("Invalid data format from weather service");
        }

        const current = data.current_condition[0];
        const nearest = data.nearest_area[0];

        const city = nearest.areaName?.[0]?.value || "Unknown City";
        const country = nearest.country?.[0]?.value || "";
        const conditionText = current.weatherDesc?.[0]?.value || "Cloudy";
        const temp = parseInt(current.temp_C) || 0;

        return {
            success: true,
            data: {
                temp,
                condition: conditionText,
                icon: mapConditionToIcon(conditionText),
                location: country ? `${city}, ${country}` : city
            }
        };
    } catch (error: any) {
        console.error("Weather Action Final Error:", error.message);
        return {
            success: false,
            error: "Serviço de clima instável no momento. Tente novamente em instantes."
        };
    }
}
