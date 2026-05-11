/**
 * MoodSpace — ReactBits Configuration Registry
 * Use este arquivo para centralizar as configurações de todos os módulos
 * do ReactBits integrados ao projeto.
 */

export const REACT_BITS_CONFIG = {
    // Configurações para o componente DotField
    dotField: {
        defaults: {
            dotRadius: 1.6,
            dotSpacing: 22,
            cursorRadius: 400,
            bulgeStrength: 60,
            glowRadius: 180,
            gradientFrom: "#A855F7",
            gradientTo: "#B497CF",
            glowColor: "rgba(168, 85, 247, 0.15)",
        },
        // Presets para diferentes "moods"
        presets: {
            subtle: {
                dotRadius: 1.2,
                dotSpacing: 24,
                gradientFrom: "rgba(255, 255, 255, 0.1)",
                gradientTo: "rgba(255, 255, 255, 0.02)",
            },
            aggressive: {
                dotRadius: 2.5,
                dotSpacing: 12,
                bulgeStrength: 100,
            }
        }
    },

    // Espaço para futuros componentes (ex: TextAnimations, Shaders, etc)
    // textAnimations: { ... },
    // grainOverlay: { ... },
};

export type ReactBitsConfig = typeof REACT_BITS_CONFIG;
