import { Prisma } from "@prisma/client";
import type { MoodBlockType } from "@/lib/validations";

// Re-export Prisma types for convenience
export type User = Prisma.UserGetPayload<Prisma.UserDefaultArgs>;
export type Room = Prisma.RoomGetPayload<Prisma.RoomDefaultArgs>;

// Re-export MoodBlockType da fonte central (Zod schema em validations.ts)
export type { MoodBlockType };

export type MoodBlockContent =
    | TextContent
    | PhotoContent
    | VideoContent
    | MusicContent
    | SocialContent
    | CountdownContent
    | GuestbookContent
    | MoodStatusContent
    | WeatherContent
    | ShapeContent
    | RorschachContent
    | DoodleContent
    | TapeContent
    | UniversalMediaContent;

export interface MoodBlock extends Omit<Prisma.MoodBlockGetPayload<Prisma.MoodBlockDefaultArgs>, 'content'> {
    type: string;
    zIndex: number;
    rotation: number;
    isLocked: boolean;
    isHidden: boolean;
    groupId: string | null;
    content: MoodBlockContent;
}

export interface BlockContentBase {
    customName?: string;
    opacity?: number;
    blendMode?: string;
    frame?: 'none' | 'polaroid' | 'polaroid-dark' | 'frame' | 'minimal' | 'round' | 'glass' | 'border' | 'shadow' | 'melt' | 'capsule';
    mask?: 'none' | 'circle' | 'heart' | 'star' | 'blob1' | 'blob2' | 'blob3';
    groupName?: string;
    [key: string]: unknown;
}

// Specific Content Interfaces
export interface TextContent extends BlockContentBase {
    text: string;
    style?: string;
    fontSize?: string;
    align?: string;
    color?: string;
    font?: string;
    behavior?: 'static' | 'ticker' | 'typewriter' | 'dialogue' | 'floating' | 'quote' | 'status';
    textColor?: string;
    speed?: number;
    direction?: 'left' | 'right';
    cursorType?: string;
    author?: string;
    showQuotes?: boolean;
    icon?: string;
    dialogueStyle?: string;
    dialogueFormat?: string;
    nameStyle?: string;
    dialogueLines?: { name: string; text: string }[];
    typingRhythm?: string;
    revealMode?: string;
}

export interface PhotoContent extends BlockContentBase {
    imageUrl: string;
    caption?: string;
    filter?: 'none' | 'vintage' | 'bw' | 'warm' | 'cool' | 'fade' | 'cinematic';
    frame?: 'none' | 'polaroid' | 'polaroid-dark' | 'frame' | 'minimal' | 'round' | 'glass' | 'border' | 'shadow' | 'melt' | 'capsule';
    mask?: 'none' | 'circle' | 'heart' | 'star' | 'blob1' | 'blob2' | 'blob3';
    ambientTint?: boolean;
    alt?: string;
}

export interface VideoContent extends BlockContentBase {
    url: string;
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    platform?: 'youtube' | 'vimeo' | 'custom';
}

export interface MusicContent extends BlockContentBase {
    url: string;
    platform?: 'spotify' | 'soundcloud' | 'apple-music';
    displayMode?: 'compact' | 'card';
}

export interface ThemeConfig {
    bg: string;
    primary: string;
    grid: string;
    bgSize: string;
    gridOpacity: string;
    filter?: string;
    blend?: string;
}

export interface RoomVisualConfig {
    theme?: string;
    uiTheme?: string;
    backgroundColor?: string | null;
    primaryColor?: string | null;
    fontStyle?: string | null;
    customCursor?: string | null;
    mouseTrails?: string | null;
    backgroundEffect?: string | null;
    customFont?: string | null;
    staticTexture?: string | null;
    avatarUrl?: string | null;
    title?: string;
    slug?: string | null;
    name?: string | null;
    username?: string | null;
}

export interface RoomVersion {
    id: string;
    roomId: string;
    blocks: MoodBlock[];
    profileData: RoomVisualConfig | null;
    isActive: boolean;
    label: string | null;
    createdAt: Date | string;
}

export interface RoomWithVersions extends Room {
    versions?: RoomVersion[];
}

export interface PublicUser {
    username: string;
    name: string | null;
    isVerified: boolean;
    verificationType: string | null;
    /** Avatar da sala primária do criador — fallback para espaços secundários sem avatar */
    primaryAvatarUrl: string | null;
    /** Usado pelo servidor para decidir mostrar 404. Não expor ao cliente. */
    isBanned: boolean;
}

export type UserRoomData = Prisma.UserGetPayload<{
    include: {
        rooms: {
            where: { isPrimary: true };
            include: {
                versions: {
                    where: { isActive: true };
                };
                blocks: {
                    where: { deletedAt: null };
                    orderBy: { order: "asc" };
                };
            };
        };
    };
}>;

export interface PublicMoodPageProps {
    publicUser: PublicUser;
    roomId: string;
    profile: Room;
    moodBlocks: MoodBlock[];
    config: ThemeConfig;
    theme: string;
    isGuest: boolean;
}

export interface SocialContent extends BlockContentBase {
    platform: string;
    url: string;
    label?: string;
    subLabel?: string;
    style?: string;
    isGrid?: boolean;
    showBg?: boolean;
}

export interface CountdownContent extends BlockContentBase {
    title: string;
    targetDate: string;
    emoji?: string;
    style?: 'minimal' | 'bold' | 'neon';
}

export interface GuestbookContent extends BlockContentBase {
    title: string;
    color?: string;
    style?: 'glass' | 'onyx' | 'silk' | 'vhs' | 'cyber' | 'paper';
    layoutMode?: 'classic' | 'stream' | 'float' | 'scattered' | 'cloud';
    density?: number;
}

export interface MoodStatusContent extends BlockContentBase {
    emoji: string;
    text?: string;
}

export interface WeatherContent extends BlockContentBase {
    state?: string;
    location?: string;
    temperature?: string;
    vibe?: string;
    temp?: number;
    icon?: string;
    mode?: 'auto' | 'manual';
}

export interface ShapeContent extends BlockContentBase {
    shapeType: 'circle' | 'rect' | 'triangle' | 'polygon' | 'blob' | 'star' | 'line' | 'grid' | 'flower' | 'mesh' | 'wave' | 'spiral';
    color: string;
    opacity: number;
    blur: number;
    sides?: number;
    points?: number;
    blendMode?: string;
    gradient?: boolean;
    seed?: number;
    glowIntensity?: number;
    isFloating?: boolean;
    floatSpeed?: number;
    gradientType?: 'linear' | 'radial';
}

export interface RorschachContent extends BlockContentBase {
    seed: number;
    color: string;
    opacity: number;
    blur: number;
    symmetry: 'vertical' | 'horizontal' | 'quad';
    complexity: number;
}

export interface DoodleContent extends BlockContentBase {
    image: string;
    color?: string;
}

export interface TapeContent extends BlockContentBase {
    color: string;
    pattern?: string;
}

/** Vídeo na fila do bloco (persistido) ou retorno de busca/import (API). */
export interface YouTubePlaylistItem {
    videoId: string;
    title?: string;
    channel?: string;
    thumbnail?: string;
    /** Preenchido na UI quando a Data API devolve (opcional no JSON salvo). */
    duration?: string;
}

export interface UniversalMediaContent extends BlockContentBase {
    mediaType: 'video' | 'music' | 'audio' | 'media';
    videoId?: string;
    videoTitle?: string;
    videoChannel?: string;
    videoThumbnail?: string;
    trackId?: string;
    audioUrl?: string;
    name?: string;
    artist?: string;
    albumArt?: string;
    caption?: string;
    lyrics?: string;
    lyricsDisplay?: 'integrated' | 'fullscreen';
    trackName?: string;
    audioStyle?: 'classic' | 'aura' | 'dots';
    /** Vários vídeos em sequência (avanço automático ao terminar). */
    playlist?: YouTubePlaylistItem[];
    playlistMode?: boolean;
    /** Lista visível no bloco para escolher faixa (jukebox). Requer fila com itens. */
    jukeboxMode?: boolean;
}
