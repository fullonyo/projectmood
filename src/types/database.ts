
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

// ─── Draft/Publish System Types ──────────────────────────────────────────────

/** Configurações visuais do perfil (snapshot imutável no ProfileVersion) */
export interface ProfileVisualConfig {
    theme: string;
    backgroundColor: string | null;
    primaryColor: string | null;
    fontStyle: string | null;
    customCursor: string | null;
    mouseTrails: string | null;
    backgroundEffect: string | null;
    customFont: string | null;
    staticTexture: string | null;
    avatarUrl: string | null;
}

/** Versão publicada de um perfil (snapshot imutável) */
export interface ProfileVersion {
    id: string;
    profileId: string;
    blocks: MoodBlock[];
    profileData: ProfileVisualConfig | null;
    isActive: boolean;
    label: string | null;
    createdAt: Date | string;
}

/** Profile com versões incluídas (resultado do include do Prisma) */
export interface ProfileWithVersions extends Profile {
    versions?: ProfileVersion[];
}

// ─── Public Page Types ───────────────────────────────────────────────────────

/** DTO sanitizado do User para envio ao client (sem password/email/id) */
export interface PublicUser {
    username: string;
    name: string | null;
    isVerified: boolean;
    verificationType: string | null;
}

/** Props tipadas do componente PublicMoodPageClient */
export interface PublicMoodPageProps {
    publicUser: PublicUser;
    profileId: string;
    profile: Profile;
    moodBlocks: MoodBlock[];
    config: ThemeConfig;
    theme: string;
    isGuest: boolean;
}

// ─── Content Types ───────────────────────────────────────────────────────────

export interface SocialContent {
    platform: string;
    url: string;
    label?: string;
    style?: 'tag' | 'glass' | 'minimal' | 'neon';
}

export interface CountdownContent {
    label: string;
    targetDate: string;
    icon?: string;
    style?: string;
}

export interface GuestbookContent {
    title: string;
    color?: string;
}

export interface MoodStatusContent {
    emoji: string;
    text?: string;
}

export interface WeatherContent {
    state: string;
    location?: string;
    temperature?: string;
}
