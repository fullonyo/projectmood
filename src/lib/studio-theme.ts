/**
 * MoodSpace Studio — Design Tokens & Theme Configuration
 * Centralizing the "Studio" aesthetic for Landing, Auth, and Dashboard.
 */

export const STUDIO_THEME = {
    // Core Colors
    colors: {
        background: "#09090b", // zinc-950
        foreground: "#ffffff",
        muted: "#52525b",      // zinc-500
        border: "rgba(255, 255, 255, 0.1)",
        accent: "#ffffff",
        error: "#f87171",      // red-400
        success: "#4ade80",    // green-400
    },

    // Global Effects
    effects: {
        background: {
            type: "aurora" as const,
            primaryColor: "#18181b",
        },
        texture: {
            type: "cross" as const,
            opacity: 0.2,
        },
        blur: {
            standard: "backdrop-blur-md",
            heavy: "backdrop-blur-2xl",
        }
    },

    // Typography & Spacing
    typography: {
        tracking: {
            tighter: "tracking-tighter",
            widest: "tracking-[0.5em]",
            standard: "tracking-[0.3em]",
        },
        fontMono: "font-mono",
        fontSans: "font-sans",
    },

    // UI Patterns
    ui: {
        radius: "rounded-none", // Estética Studio prefere cantos retos
        borderWidth: "border-[0.5px]",
        transition: "transition-all duration-500 ease-in-out",
    }
} as const;

export type StudioTheme = typeof STUDIO_THEME;
