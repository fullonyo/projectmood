interface CustomTextureStyle extends React.CSSProperties {
    '--room-texture-img'?: string;
    '--room-texture-opacity'?: number;
    '--room-texture-filter'?: string;
    '--room-texture-blend'?: string;
}

export function getStaticTextureStyle(type: string, color?: string): CustomTextureStyle {
    if (!type || type === 'none') return {}

    const svgColor = encodeURIComponent(color || '#000000')

    const textures: Record<string, { img: string; opacity: number; filter?: string; blend?: string }> = {
        // Novas Texturas Vetoriais Próprias (Peso 0kb - Apenas GPU)
        'noise': {
            img: 'data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'saturate\' values=\'0\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E',
            opacity: 0.08,
            blend: 'normal'
        },
        'dots': {
            img: `data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='8' cy='8' r='1.5' fill='${svgColor}' fill-opacity='1'/%3E%3C/svg%3E`,
            opacity: 0.15,
            blend: 'normal'
        },
        'lines': {
            img: `data:image/svg+xml,%3Csvg width='100%25' height='24' viewBox='0 0 100 24' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='0' y1='23.5' x2='100%25' y2='23.5' stroke='${svgColor}' stroke-width='1.2' stroke-opacity='1'/%3E%3C/svg%3E`,
            opacity: 0.12,
            blend: 'normal'
        },
        'cross': {
            img: `data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 18,20 L 22,20 M 20,18 L 20,22' stroke='${svgColor}' stroke-width='1' fill='none' stroke-opacity='1'/%3E%3C/svg%3E`,
            opacity: 0.20,
            blend: 'normal'
        },

        // Legados Refatorados (Imagens antigas garantidas para aparecer em qualquer fundo)
        'museum-paper': { img: 'https://www.transparenttextures.com/patterns/cream-paper.png', opacity: 0.12, blend: 'normal' },
        'raw-canvas': { img: 'https://www.transparenttextures.com/patterns/canvas-orange.png', opacity: 0.08, filter: 'grayscale(1)', blend: 'normal' },
        'fine-sand': { img: 'https://www.transparenttextures.com/patterns/pollen.png', opacity: 0.10, blend: 'normal' }
    }

    const config = textures[type]
    if (!config) return {}

    return {
        '--room-texture-img': `url("${config.img}")`,
        '--room-texture-opacity': config.opacity,
        '--room-texture-filter': config.filter || 'none',
        '--room-texture-blend': config.blend || 'normal'
    };
}

export function StaticTextures({ type, color }: { type: string, color?: string }) {
    const style = getStaticTextureStyle(type, color);
    if (!style || Object.keys(style).length === 0) return null;
    return (
        <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
                backgroundImage: style['--room-texture-img'],
                opacity: style['--room-texture-opacity'],
                filter: style['--room-texture-filter'],
                mixBlendMode: (style['--room-texture-blend'] as React.CSSProperties['mixBlendMode']) || 'normal'
            }}
        />
    )
}
