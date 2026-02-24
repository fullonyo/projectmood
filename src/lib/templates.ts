import { Box, LayoutGrid, Cloud, Sparkles, Terminal, Zap, StickyNote, Book, Sun, Palette, Moon, Wind } from "lucide-react"

export interface TemplateBlock {
    type: string;
    content: any;
    x: number;
    y: number;
    width?: number;
    height?: number;
    zIndex?: number;
}

export interface MoodTemplate {
    id: string;
    tk: string; // Translation key
    icon: any;
    profile: {
        backgroundEffect: string;
        backgroundColor: string;
        primaryColor: string;
        theme: 'dark' | 'light';
        staticTexture?: string;
        customCursor?: string;
        mouseTrails?: string;
    };
    blocks: TemplateBlock[];
}

export const MOOD_TEMPLATES: Record<string, MoodTemplate> = {
    focus: {
        id: 'focus',
        tk: 'focus',
        icon: Sparkles,
        profile: {
            backgroundEffect: 'aurora',
            backgroundColor: '#050505',
            primaryColor: '#ffffff',
            theme: 'dark',
            staticTexture: 'none',
            customCursor: 'retro',
            mouseTrails: 'none'
        },
        blocks: [
            // Background Aura
            {
                type: 'shape',
                content: { shape: 'rect', color: '#ffffff', opacity: 0.03, blur: 80 },
                x: 25, y: 20, width: 600, height: 600, zIndex: 1
            },
            // Content
            {
                type: 'text',
                content: { behavior: 'typewriter', text: 'SYSTEM.PROTOCOL(DEEP_WORK) // ACTIVE', color: '#ffffff' },
                x: 35, y: 32, width: 450, height: 70, zIndex: 100
            },
            {
                type: 'countdown',
                content: { title: 'FOCUS_SESSION', targetDate: new Date(Date.now() + 25 * 60000).toISOString(), style: 'minimal' },
                x: 35, y: 40, width: 300, height: 160, zIndex: 90
            },
            {
                type: 'media',
                content: { mediaType: 'music', trackId: '4uLU61C9HSH5pBqaST9pS5', isPublic: true },
                x: 52, y: 40, width: 280, height: 350, zIndex: 95
            },
            {
                type: 'social',
                content: { platform: 'github', url: 'https://github.com', label: 'SOURCE_CODE', style: 'glass', showBg: true },
                x: 35, y: 58, width: 220, height: 50, zIndex: 100
            }
        ]
    },
    scrapbook: {
        id: 'scrapbook',
        tk: 'scrapbook',
        icon: StickyNote,
        profile: {
            backgroundEffect: 'none',
            backgroundColor: '#fdf6e3',
            primaryColor: '#433422',
            theme: 'light',
            staticTexture: 'museum-paper',
            customCursor: 'auto',
            mouseTrails: 'none'
        },
        blocks: [
            // Decorative Auras
            {
                type: 'shape',
                content: { shape: 'blob', color: '#e6d5b8', opacity: 0.1, variation: 0.8 },
                x: 15, y: 15, width: 800, height: 800, zIndex: 1
            },
            {
                type: 'shape',
                content: { shape: 'flower', color: '#859900', opacity: 0.08 },
                x: 75, y: 10, width: 250, height: 250, zIndex: 2
            },
            // Primary Content
            {
                type: 'guestbook',
                content: { title: 'Mural de Memórias', style: 'paper', layoutMode: 'scattered', density: 0.8 },
                x: 28, y: 25, width: 420, height: 500, zIndex: 50
            },
            {
                type: 'photo',
                content: { imageUrl: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?q=80&w=1000', caption: 'Captured essence.', filter: 'vintage', frame: 'polaroid' },
                x: 52, y: 28, width: 280, height: 360, zIndex: 60
            },
            {
                type: 'social',
                content: { platform: 'instagram', url: 'https://instagram.com', label: 'MEMORIES', style: 'tag', showBg: true },
                x: 52, y: 68, width: 180, height: 45, zIndex: 70
            }
        ]
    },
    cyber: {
        id: 'cyber',
        tk: 'cyber',
        icon: Terminal,
        profile: {
            backgroundEffect: 'grid-move',
            backgroundColor: '#000000',
            primaryColor: '#00ffff',
            theme: 'dark',
            staticTexture: 'noise',
            customCursor: 'pixel',
            mouseTrails: 'pixel-dust'
        },
        blocks: [
            // Background Elements
            {
                type: 'shape',
                content: { shape: 'grid', color: '#00ffff', opacity: 0.05 },
                x: 20, y: 20, width: 900, height: 900, zIndex: 1
            },
            // Content
            {
                type: 'text',
                content: { behavior: 'ticker', text: 'NEURAL_LINK_ESTABLISHED // DATA_STREAM_STABLE // SYSTEM_ONLINE', color: '#00ffff', speed: 12 },
                x: 0, y: 0, width: 1920, height: 40, zIndex: 200
            },
            {
                type: 'media',
                content: { mediaType: 'video', videoId: '5W_9f5tUfUI', isPublic: true },
                x: 30, y: 28, width: 450, height: 253, zIndex: 90
            },
            {
                type: 'guestbook',
                content: { title: 'NETWORK_LOGS', style: 'vhs', layoutMode: 'classic' },
                x: 30, y: 56, width: 350, height: 350, zIndex: 100
            },
            {
                type: 'social',
                content: { platform: 'discord', url: 'https://discord.com', label: 'COMM_CENTER', style: 'neon', showBg: true },
                x: 52, y: 56, width: 220, height: 50, zIndex: 110
            }
        ]
    },
    zen: {
        id: 'zen',
        tk: 'zen',
        icon: Wind,
        profile: {
            backgroundEffect: 'liquid',
            backgroundColor: '#f0f4ff',
            primaryColor: '#6366f1',
            theme: 'light',
            staticTexture: 'fine-sand',
            customCursor: 'ghost',
            mouseTrails: 'sparkles'
        },
        blocks: [
            // Background Auras
            {
                type: 'shape',
                content: { shape: 'circle', color: '#6366f1', opacity: 0.04, blur: 120 },
                x: 25, y: 15, width: 700, height: 700, zIndex: 1
            },
            // Content
            {
                type: 'weather',
                content: { location: 'Kyoto', vibe: 'Zen Garden', style: 'glass' },
                x: 38, y: 28, width: 300, height: 130, zIndex: 100
            },
            {
                type: 'media',
                content: { mediaType: 'music', trackId: '37i9dQZF1DWZqd5Jv99C9Z', isPublic: true },
                x: 38, y: 44, width: 280, height: 350, zIndex: 95
            },
            {
                type: 'text',
                content: { behavior: 'floating', text: 'Breathe in... Breathe out...', color: '#6366f1', fontScale: 1.5 },
                x: 58, y: 35, width: 350, height: 80, zIndex: 100
            },
            {
                type: 'social',
                content: { platform: 'custom', url: 'https://moodspace.com', label: 'MIRROR_SELF', style: 'aura', showBg: true },
                x: 58, y: 55, width: 200, height: 45, zIndex: 110
            }
        ]
    }
}
