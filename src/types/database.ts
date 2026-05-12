import { Prisma } from "@prisma/client";
import type { MoodBlockType } from "@/lib/validations";

// Re-export Prisma types for convenience
export type User = Prisma.UserGetPayload<{}>;
export type Room = Prisma.RoomGetPayload<{}>;

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

export interface MoodBlock extends Omit<Prisma.MoodBlockGetPayload<{}>, 'content'> {
    type: string;
    zIndex: number;
    rotation: number;
    isLocked: boolean;
    isHidden: boolean;
    groupId: string | null;
    content: MoodBlockContent;
}

// Specific Content Interfaces
export interface TextContent {
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
    customName?: string;
    [key: string]: any;
}

export interface PhotoContent {
    imageUrl: string;
    caption?: string;
    frame?: 'none' | 'polaroid' | 'polaroid-dark' | 'frame' | 'minimal' | 'round' | 'border' | 'shadow' | 'glass';
    filter?: 'none' | 'vintage' | 'bw' | 'warm' | 'cool';
    alt?: string;
    customName?: string;
    [key: string]: any;
}

export interface VideoContent {
    url: string;
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    platform?: 'youtube' | 'vimeo' | 'custom';
    customName?: string;
    [key: string]: any;
}

export interface MusicContent {
    url: string;
    platform?: 'spotify' | 'soundcloud' | 'apple-music';
    displayMode?: 'compact' | 'card';
    customName?: string;
    [key: string]: any;
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

export interface SocialContent {
    platform: string;
    url: string;
    label?: string;
    subLabel?: string;
    style?: string;
    isGrid?: boolean;
    showBg?: boolean;
    customName?: string;
    [key: string]: any;
}

export interface CountdownContent {
    title: string;
    targetDate: string;
    emoji?: string;
    style?: 'minimal' | 'bold' | 'neon';
    customName?: string;
    [key: string]: any;
}

export interface GuestbookContent {
    title: string;
    color?: string;
    style?: 'glass' | 'onyx' | 'silk' | 'vhs' | 'cyber' | 'paper';
    layoutMode?: 'classic' | 'stream' | 'float' | 'scattered' | 'cloud';
    density?: number;
    opacity?: number;
    blendMode?: string;
    customName?: string;
    [key: string]: any;
}

export interface MoodStatusContent {
    emoji: string;
    text?: string;
    customName?: string;
    [key: string]: any;
}

export interface WeatherContent {
    state?: string;
    location?: string;
    temperature?: string;
    vibe?: string;
    temp?: number;
    icon?: string;
    mode?: 'auto' | 'manual';
    opacity?: number;
    blendMode?: string;
    customName?: string;
    [key: string]: any;
}

export interface ShapeContent {
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
    customName?: string;
    [key: string]: any;
}

export interface RorschachContent {
    seed: number;
    color: string;
    opacity: number;
    blur: number;
    symmetry: 'vertical' | 'horizontal' | 'quad';
    complexity: number;
    customName?: string;
    [key: string]: any;
}

export interface DoodleContent {
    image: string;
    color?: string;
    opacity?: number;
    customName?: string;
    [key: string]: any;
}

export interface TapeContent {
    color: string;
    pattern?: string;
    opacity?: number;
    customName?: string;
    [key: string]: any;
}

export interface UniversalMediaContent {
    mediaType: 'video' | 'music' | 'audio' | 'media';
    videoId?: string;
    trackId?: string;
    audioUrl?: string;
    name?: string;
    artist?: string;
    albumArt?: string;
    frame?: string;
    caption?: string;
    lyrics?: string;
    lyricsDisplay?: 'integrated' | 'fullscreen';
    customName?: string;
    [key: string]: any;
}
