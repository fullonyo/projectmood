export type BlockType = 'text' | 'gif' | 'tape' | 'weather' | 'media' | 'doodle' | 'social' | 'music';

export interface TextContent {
    text: string;
    style: 'postit' | 'ripped' | 'typewriter' | 'simple';
    fontSize: 'sm' | 'xl' | '3xl';
    align: 'left' | 'center' | 'right';
    bgColor?: string;
}

export interface GifContent {
    url: string;
}

export interface TapeContent {
    color: string;
    pattern: 'solid' | 'dots';
}

export interface SocialContent {
    platform: string;
    url: string;
    label: string;
    style: 'tag' | 'glass' | 'minimal' | 'neon';
}

export interface MoodBlock {
    id: string;
    userId: string;
    type: BlockType;
    content: any;
    x: number; // Percentual (0-100)
    y: number; // Percentual (0-100)
    zIndex: number;
    rotation: number;
}
