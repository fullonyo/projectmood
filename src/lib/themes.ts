export const themeConfigs: Record<string, {
    bg: string;
    primary: string;
    grid: string;
    bgSize: string;
    gridOpacity: string;
    filter?: string;
    blend?: string;
}> = {
    light: {
        bg: '#fafafa',
        primary: '#18181b',
        grid: 'radial-gradient(currentColor 1px, transparent 1px)',
        bgSize: '40px 40px',
        gridOpacity: 'opacity-[0.03] dark:opacity-[0.08]',
        blend: 'mix-blend-normal'
    },
    dark: {
        bg: '#050505',
        primary: '#ffffff',
        grid: 'radial-gradient(currentColor 1px, transparent 1px)',
        bgSize: '40px 40px',
        gridOpacity: 'opacity-[0.08]',
        blend: 'mix-blend-normal'
    },
    vintage: {
        bg: '#f4ead5',
        primary: '#5d4037',
        grid: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'saturate\' values=\'0\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        bgSize: '200px 200px',
        gridOpacity: 'opacity-10',
        blend: 'mix-blend-normal'
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
    },
    neobrutalism: {
        bg: '#fdf0d5',
        primary: '#111111',
        grid: 'linear-gradient(#111111 2px, transparent 2px)',
        bgSize: '100% 40px',
        gridOpacity: 'opacity-100'
    },
    botanical: {
        bg: '#e6e9e1',
        primary: '#334338',
        grid: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        bgSize: '150px 150px',
        gridOpacity: 'opacity-15'
    },
    ethereal: {
        bg: '#f5f5fa',
        primary: '#3b2c63',
        grid: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
        bgSize: '80px 80px',
        gridOpacity: 'opacity-5',
        filter: 'blur(2px) contrast(110%)'
    },
    charcoal: {
        bg: '#1c1c1e',
        primary: '#d1d1d6',
        grid: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
        bgSize: '50px 50px',
        gridOpacity: 'opacity-[0.04]'
    },
    terminal: {
        bg: '#020B02',
        primary: '#00ff41',
        grid: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.05) 3px, rgba(0, 255, 65, 0.05) 4px)',
        bgSize: '100% 4px',
        gridOpacity: 'opacity-100',
        filter: 'contrast(120%) brightness(90%)',
        blend: 'mix-blend-normal'
    },

    // Artistic & Drawn Backgrounds
    doodle: {
        bg: '#ffffff',
        primary: '#1a1a1a',
        grid: 'url("data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' viewBox=\'0 0 120 120\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M9 42l2-16 14 3-1-3L6 22 2 41zM100 22a4 4 0 11-8 0 4 4 0 018 0zM17 104a3 3 0 11-6 0 3 3 0 016 0zM105 104l-6-16-16-1 2-2 18 1 5 16z\' fill=\'%23000000\' fill-opacity=\'.08\' fill-rule=\'evenodd\'/%3E%3Cpath d=\'M60 55a5 5 0 100 10 5 5 0 000-10zm-7 5a7 7 0 1114 0 7 7 0 01-14 0z\' fill=\'%23000000\' fill-opacity=\'.12\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
        bgSize: '120px 120px',
        gridOpacity: 'opacity-100',
        blend: 'mix-blend-normal'
    },
    manga: {
        bg: '#e8e8e8',
        primary: '#000000',
        grid: 'url("data:image/svg+xml,%3Csvg width=\'8\' height=\'8\' viewBox=\'0 0 8 8\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'4\' cy=\'4\' r=\'2.5\' fill=\'%23000000\' fill-opacity=\'0.25\'/%3E%3C/svg%3E")',
        bgSize: '8px 8px',
        gridOpacity: 'opacity-100',
        filter: 'contrast(130%)',
        blend: 'mix-blend-normal'
    },
    y2k: {
        bg: '#cceeff',
        primary: '#ff3399',
        grid: 'radial-gradient(circle at 100% 50%, rgba(255, 255, 255, 0.4) 0%, transparent 40%), radial-gradient(circle at 0% 10%, rgba(255, 105, 180, 0.15) 0%, transparent 30%), url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M25 25 Q 50 0 75 25 T 25 75 Z\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'1.5\' stroke-opacity=\'0.4\'/%3E%3Ccircle cx=\'80\' cy=\'20\' r=\'5\' fill=\'%23ffffff\' fill-opacity=\'0.5\'/%3E%3Ccircle cx=\'20\' cy=\'80\' r=\'4\' fill=\'%23ffffff\' fill-opacity=\'0.5\'/%3E%3C/svg%3E")',
        bgSize: '100% 100%, 100% 100%, 150px 150px',
        gridOpacity: 'opacity-100',
        blend: 'mix-blend-normal'
    },
    tarot: {
        bg: '#140c21',
        primary: '#d4af37',
        grid: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg stroke=\'%23d4af37\' stroke-opacity=\'0.25\' fill=\'none\' stroke-width=\'1\'%3E%3Ccircle cx=\'100\' cy=\'100\' r=\'80\'/%3E%3Ccircle cx=\'100\' cy=\'100\' r=\'70\'/%3E%3Cpolygon points=\'100,5 195,65 158,180 42,180 5,65\'/%3E%3Cline x1=\'100\' y1=\'20\' x2=\'100\' y2=\'180\'/%3E%3Cline x1=\'20\' y1=\'100\' x2=\'180\' y2=\'100\'/%3E%3Ccircle cx=\'100\' cy=\'100\' r=\'10\' fill=\'%23d4af37\' fill-opacity=\'0.1\'/%3E%3C/g%3E%3C/svg%3E")',
        bgSize: '300px 300px',
        gridOpacity: 'opacity-100',
        blend: 'mix-blend-normal'
    }
};
