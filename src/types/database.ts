
import { Prisma } from "@prisma/client";

// Re-export Prisma types for convenience
export type User = Prisma.UserGetPayload<{}>;
export type Profile = Prisma.ProfileGetPayload<{}>;

// Explicit MoodBlock Type matching Prisma schema but with typed Content
export type MoodBlockType =
    | 'text'
    | 'ticker'
    | 'subtitle'
    | 'floating'
    | 'gif'
    | 'video'
    | 'social'
    | 'guestbook'
    | 'tape'
    | 'doodle'
    | 'weather'
    | 'media'
    | 'music'
    | 'quote'
    | 'photo'
    | 'moodStatus'
    | 'countdown';

export interface MoodBlock extends Omit<Prisma.MoodBlockGetPayload<{}>, 'content'> {
    type: string; // Prisma stores as string, but we can narrow it down in UI
    content: any; // Using any for now as content logic is dynamic, but we can refine specific interfaces
}

// Specific Content Interfaces for stricter typing where possible
export interface TextContent {
    text: string;
    style?: string;
    fontSize?: string;
    align?: string;
    color?: string;
    font?: string;
}

export interface PhotoContent {
    imageUrl: string;
    caption?: string;
    frame?: 'none' | 'polaroid' | 'polaroid-dark' | 'frame' | 'minimal' | 'round';
    filter?: 'none' | 'vintage' | 'bw' | 'warm' | 'cool';
    alt?: string;
}

export interface VideoContent {
    url: string;
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    platform?: 'youtube' | 'vimeo' | 'custom';
}

export interface MusicContent {
    url: string;
    platform?: 'spotify' | 'soundcloud' | 'apple-music';
    displayMode?: 'compact' | 'card';
}

// Theme Configuration Interface
export interface ThemeConfig {
    bg: string;
    primary: string;
    grid: string;
    bgSize: string;
    gridOpacity: string;
}
