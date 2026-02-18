export const themeConfigs: Record<string, {
    bg: string;
    primary: string;
    grid: string;
    bgSize: string;
    gridOpacity: string;
    filter?: string;
}> = {
    light: {
        bg: '#fafafa',
        primary: '#18181b',
        grid: 'radial-gradient(currentColor 1px, transparent 1px)',
        bgSize: '40px 40px',
        gridOpacity: 'opacity-[0.03] dark:opacity-[0.08]'
    },
    dark: {
        bg: '#050505',
        primary: '#ffffff',
        grid: 'radial-gradient(currentColor 1px, transparent 1px)',
        bgSize: '40px 40px',
        gridOpacity: 'opacity-[0.08]'
    },
    vintage: {
        bg: '#f4ead5',
        primary: '#5d4037',
        grid: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        bgSize: '200px 200px',
        gridOpacity: 'opacity-25',
        filter: 'contrast(105%) brightness(105%)'
    },
    notebook: {
        bg: '#ffffff',
        primary: '#1e3a8a',
        grid: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, transparent 79px, #fca5a5 1px, #fca5a5 2px, transparent 81px)',
        bgSize: '100% 30px',
        gridOpacity: 'opacity-100'
    },
    blueprint: {
        bg: '#1a3a5f',
        primary: '#ffffff',
        grid: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        bgSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
        gridOpacity: 'opacity-100'
    },
    canvas: {
        bg: '#e7e5e4',
        primary: '#44403c',
        grid: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20L0 20z\' fill=\'%23000\' fill-opacity=\'.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
        bgSize: '40px 40px',
        gridOpacity: 'opacity-100'
    },
    cyberpunk: {
        bg: '#000000',
        primary: '#ff00ff',
        grid: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px), linear-gradient(0deg, rgba(255,0,255,0.03) 50%, transparent 50%)',
        bgSize: '40px 40px, 40px 40px, 100% 4px',
        gridOpacity: 'opacity-100'
    }
};
