"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface SmartRorschachProps {
    seed?: number
    color?: string
    opacity?: number
    blur?: number
    symmetry?: 'vertical' | 'horizontal' | 'quad'
    complexity?: number
}

// Deterministic random from seed
function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export function SmartRorschach({
    seed = 42,
    color = "currentColor",
    opacity = 1,
    blur = 0,
    symmetry = 'vertical',
    complexity = 5
}: SmartRorschachProps) {

    // Unique ID for SVG filters to avoid collisions
    const filterId = useMemo(() => `rorschach-filter-${seed}`, [seed]);

    const paths = useMemo(() => {
        const generatedPaths: string[] = [];
        const numShapes = Math.floor(complexity * 1.5) + 3;

        let localSeed = seed;
        const getRand = () => {
            localSeed += 1;
            return seededRandom(localSeed);
        };

        for (let i = 0; i < numShapes; i++) {
            // Generate basic points in a "half" or "quarter" section
            const points: [number, number][] = [];
            const numPoints = Math.floor(getRand() * 3) + 3; // 3 to 5 points

            // Area distribution based on symmetry
            const maxX = symmetry === 'vertical' || symmetry === 'quad' ? 50 : 100;
            const maxY = symmetry === 'horizontal' || symmetry === 'quad' ? 50 : 100;

            const centerX = getRand() * maxX;
            const centerY = getRand() * maxY;

            for (let j = 0; j < numPoints; j++) {
                const angle = (j / numPoints) * Math.PI * 2;
                const dist = getRand() * 20 + 5;
                const px = centerX + Math.cos(angle) * dist;
                const py = centerY + Math.sin(angle) * dist;
                points.push([px, py]);
            }

            // Create smooth path
            let d = `M ${points[0][0]} ${points[0][1]}`;
            for (let j = 1; j < points.length; j++) {
                const prev = points[j - 1];
                const curr = points[j];
                const next = points[(j + 1) % points.length];

                const cp1x = prev[0] + (curr[0] - prev[0]) / 2;
                const cp1y = prev[1] + (curr[1] - prev[1]) / 2;

                d += ` Q ${curr[0]} ${curr[1]}, ${cp1x} ${cp1y}`;
            }
            d += " Z";
            generatedPaths.push(d);
        }

        return generatedPaths;
    }, [seed, complexity, symmetry]);

    return (
        <div className="w-full h-full relative group overflow-hidden">
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
                style={{ filter: blur > 0 ? `blur(${blur}px)` : 'none' }}
            >
                <defs>
                    <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                        {/* Ink bleeding effect */}
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                            result="ink"
                        />
                        <feComposite in="SourceGraphic" in2="ink" operator="atop" />
                    </filter>
                </defs>

                <g filter={`url(#${filterId})`} opacity={opacity} fill={color}>
                    {/* Render original and mirrored parts */}
                    {paths.map((p, i) => (
                        <g key={i}>
                            <motion.path
                                d={p}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.05, type: 'spring' }}
                            />

                            {(symmetry === 'vertical' || symmetry === 'quad') && (
                                <motion.path
                                    d={p}
                                    style={{ transformOrigin: 'center', transform: 'scaleX(-1) translateX(-100%)' }}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.05, type: 'spring' }}
                                />
                            )}

                            {(symmetry === 'horizontal' || symmetry === 'quad') && (
                                <motion.path
                                    d={p}
                                    style={{ transformOrigin: 'center', transform: 'scaleY(-1) translateY(-100%)' }}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.05, type: 'spring' }}
                                />
                            )}

                            {symmetry === 'quad' && (
                                <motion.path
                                    d={p}
                                    style={{ transformOrigin: 'center', transform: 'scale(-1) translate(-100%, -100%)' }}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.05, type: 'spring' }}
                                />
                            )}
                        </g>
                    ))}
                </g>
            </svg>

            {/* Subtle "Breathing" animation overlay (optional, but adds premium feel) */}
            <motion.div
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-20"
                animate={{
                    background: [
                        'radial-gradient(circle at 50% 50%, transparent 0%, transparent 100%)',
                        'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
                        'radial-gradient(circle at 50% 50%, transparent 0%, transparent 100%)'
                    ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
        </div>
    )
}
