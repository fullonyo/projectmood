"use client"

import { cn } from "@/lib/utils"
import React from "react"
import { useStudioBlock } from "@/hooks/use-studio-block"

export type ShapeType = 'circle' | 'rect' | 'triangle' | 'polygon' | 'blob' | 'star' | 'line' | 'grid' | 'flower' | 'mesh' | 'wave' | 'spiral'

interface SmartShapeProps {
    type?: ShapeType
    color?: string
    opacity?: number
    blur?: number
    sides?: number // For polygons
    points?: number // For stars
    seed?: number // For blob variations
    glowIntensity?: number // 0 to 100
    isFloating?: boolean
    floatSpeed?: number // 1 to 10 (seconds)
    gradient?: boolean
    gradientColors?: string[]
    gradientType?: 'linear' | 'radial'
    className?: string
}

/**
 * SmartShape - Padronizado com Studio FUS 💎
 * Utiliza o hook universal useStudioBlock para escala fluida baseada em área.
 */
export const SmartShape = React.memo(({
    type = 'circle',
    color = '#3b82f6',
    opacity = 1,
    blur = 0,
    sides = 5,
    points = 5,
    seed = 0,
    glowIntensity = 0,
    isFloating = false,
    floatSpeed = 5,
    gradient = false,
    gradientColors = ['#3b82f6', '#8b5cf6'],
    gradientType = 'linear',
    className
}: SmartShapeProps) => {
    // Hook Padronizado Studio
    const { ref, fluidScale, viewportScale } = useStudioBlock()

    const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        filter: blur > 0 ? `blur(${blur * fluidScale}px)` : 'none',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: isFloating ? `studio-float ${11 - floatSpeed}s ease-in-out infinite` : 'none',
        // @ts-ignore
        '--float-offset': `translateY(-${10 * fluidScale}px)`
    }

    const glowStyle: React.CSSProperties = {
        filter: glowIntensity > 0
            ? `drop-shadow(0 0 ${glowIntensity * 0.2 * fluidScale}px ${color})`
            : 'none',
        willChange: isFloating ? 'transform, filter' : 'filter'
    }

    const renderShape = () => {
        const fill = gradient
            ? `url(#grad-${type})`
            : color

        const commonStrokeProps = {
            stroke: fill,
            strokeWidth: Math.max(1, 2 * fluidScale),
            fill: 'none',
            strokeLinecap: 'round' as const,
            strokeLinejoin: 'round' as const
        }

        switch (type) {
            case 'circle':
                return (
                    <circle cx="50" cy="50" r="48" fill={fill} />
                )
            case 'rect':
                return (
                    <rect x="2" y="2" width="96" height="96" rx={Math.round(2 * fluidScale)} fill={fill} />
                )
            case 'triangle':
                return (
                    <polygon points="50,5 95,95 5,95" fill={fill} />
                )
            case 'polygon': {
                const s = Math.max(3, sides)
                const pts = []
                for (let i = 0; i < s; i++) {
                    const angle = (i / s) * Math.PI * 2 - Math.PI / 2
                    const x = (50 + 45 * Math.cos(angle)).toFixed(2)
                    const y = (50 + 45 * Math.sin(angle)).toFixed(2)
                    pts.push(`${x},${y}`)
                }
                return <polygon points={pts.join(' ')} fill={fill} />
            }
            case 'star': {
                const p = Math.max(3, points)
                const pts = []
                const innerRadius = 20
                const outerRadius = 45
                for (let i = 0; i < p * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius
                    const angle = (i / (p * 2)) * Math.PI * 2 - Math.PI / 2
                    const x = (50 + radius * Math.cos(angle)).toFixed(2)
                    const y = (50 + radius * Math.sin(angle)).toFixed(2)
                    pts.push(`${x},${y}`)
                }
                return <polygon points={pts.join(' ')} fill={fill} />
            }
            case 'blob': {
                const paths = [
                    "M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.7,-31.3,87.1,-15.7,86.2,-0.5C85.3,14.7,80.1,29.3,71.8,42.4C63.5,55.5,52.1,67,38.7,74.1C25.3,81.2,9.9,83.9,-4.6,83.9C-19.1,83.9,-32.8,81.2,-45.1,74.1C-57.4,67,-68.3,55.5,-75.6,42.4C-82.9,29.3,-86.6,14.7,-86.9,-0.2C-87.2,-15.1,-84.1,-30.2,-76.3,-43.5C-68.5,-56.8,-56,-68.3,-42.1,-75.3C-28.2,-82.3,-14.1,-84.8,0.5,-85.6C15.1,-86.4,31.3,-83.6,44.7,-76.4Z",
                    "M41.5,-61.2C53.7,-54.1,63.4,-42.1,68.1,-28.9C72.8,-15.6,72.4,-1.1,69.3,12.5C66.1,26.1,60.1,38.8,50,49.2C39.8,59.6,25.5,67.7,11.3,70.5C-2.9,73.4,-16.9,71,-29.4,64.8C-41.9,58.6,-52.8,48.6,-61,36.8C-69.2,25,-74.6,11.5,-74.3,-1.9C-74,-15.3,-67.9,-28.7,-58.5,-39.8C-49.1,-50.9,-36.3,-59.7,-23,-65.3C-9.7,-70.9,4.2,-73.2,16.2,-70.5C28.2,-67.8,38.3,-60.1,41.5,-61.2Z",
                    "M36.7,-51.2C47.2,-43.4,55.2,-31.8,57.6,-19.1C60.1,-6.3,56.9,7.6,50.7,19.3C44.4,30.9,35,40.4,24.1,45.6C13.2,50.7,0.8,51.6,-10.8,48.8C-22.3,46.1,-33.1,39.8,-41.2,30.4C-49.3,21.1,-54.7,8.6,-55,-4.4C-55.3,-17.4,-50.5,-31,-41.4,-39.1C-32.3,-47.2,-18.8,-49.8,-5.5,-52.4C7.8,-55.1,22.1,-57.8,36.7,-51.2Z",
                    "M45.5,-63.4C58.1,-57.1,66.7,-42.1,70.1,-26.8C73.4,-11.5,71.5,4,66.1,17.2C60.7,30.4,51.8,41.3,40.5,50.1C29.2,58.9,15.5,65.6,0.3,65.1C-14.9,64.6,-31.5,57,-43.8,46.2C-56.1,35.4,-64,21.4,-67.2,5.9C-70.4,-9.7,-68.9,-26.8,-60.1,-38.7C-51.3,-50.6,-35.1,-57.4,-20.5,-62.7C-5.8,-68.1,7.2,-71.9,23.3,-71.2C39.4,-70.5,58.7,-65.4,45.5,-63.4Z",
                    "M33.4,-44.2C43.2,-34.5,51,-23.4,54.1,-10.8C57.2,1.8,55.6,15.9,49.1,27.5C42.6,39.1,31.2,48.2,18.4,53.8C5.6,59.3,-8.6,61.4,-20.9,57.1C-33.1,52.8,-43.4,42.2,-49.3,29.8C-55.2,17.4,-56.7,3.3,-54,-9.9C-51.4,-23.1,-44.6,-35.3,-34.5,-44.9C-24.5,-54.5,-11.2,-61.4,1.1,-62.9C13.4,-64.4,26.7,-60.4,33.4,-44.2Z"
                ]
                return (
                    <path
                        d={paths[seed] || paths[0]}
                        transform="translate(50 50) scale(0.5)"
                        fill={fill}
                    />
                )
            }
            case 'line': {
                const angle = (seed * 45) % 180
                return (
                    <line x1="5" y1="50" x2="95" y2="50" transform={`rotate(${angle} 50 50)`} {...commonStrokeProps} />
                )
            }
            case 'grid': {
                const count = Math.max(3, 3 + (seed % 4))
                const lines = []
                for (let i = 0; i <= count; i++) {
                    const pos = 5 + (90 * i) / count
                    lines.push(<line key={`h-${i}`} x1="5" y1={pos} x2="95" y2={pos} {...commonStrokeProps} strokeWidth={commonStrokeProps.strokeWidth * 0.5} />)
                    lines.push(<line key={`v-${i}`} x1={pos} y1="5" x2={pos} y2="95" {...commonStrokeProps} strokeWidth={commonStrokeProps.strokeWidth * 0.5} />)
                }
                return <g>{lines}</g>
            }
            case 'flower': {
                const petals = Math.max(5, 5 + (seed % 8))
                const path = []
                for (let i = 0; i < petals * 20; i++) {
                    const angle = (i / (petals * 20)) * Math.PI * 2
                    const r = 45 * Math.sin((petals / 2) * angle)
                    const x = (50 + r * Math.cos(angle)).toFixed(2)
                    const y = (50 + r * Math.sin(angle)).toFixed(2)
                    path.push(`${i === 0 ? 'M' : 'L'}${x},${y}`)
                }
                return <path d={path.join(' ') + ' Z'} fill={fill} />
            }
            case 'mesh': {
                const complexity = 4 + (seed % 5)
                const pts = []
                for (let i = 0; i < complexity; i++) {
                    // Simple deterministic pseudo-random based on seed
                    const x = (15 + ((Math.abs(Math.sin(seed + i)) * 10000) % 70)).toFixed(2)
                    const y = (15 + ((Math.abs(Math.cos(seed + i)) * 10000) % 70)).toFixed(2)
                    pts.push({ x: parseFloat(x), y: parseFloat(y) })
                }
                const lines = []
                for (let i = 0; i < pts.length; i++) {
                    for (let j = i + 1; j < pts.length; j++) {
                        lines.push(<line key={`${i}-${j}`} x1={pts[i].x} y1={pts[i].y} x2={pts[j].x} y2={pts[j].y} {...commonStrokeProps} strokeWidth={1} opacity={0.5} />)
                    }
                }
                return <g>{lines}</g>
            }
            case 'wave': {
                const freq = 1 + (seed % 3)
                const amp = 10 + (seed % 20)
                const pts = []
                for (let x = 5; x <= 95; x += 2) {
                    const y = (50 + amp * Math.sin((x / 100) * Math.PI * 2 * freq)).toFixed(2)
                    pts.push(`${x},${y}`)
                }
                return <path d={`M${pts.join(' L')}`} {...commonStrokeProps} fill="none" />
            }
            case 'spiral': {
                const loops = 2 + (seed % 3)
                const pts = []
                for (let i = 0; i < 100; i++) {
                    const angle = (i / 100) * Math.PI * 2 * loops
                    const r = (i / 100) * 45
                    const x = (50 + r * Math.cos(angle)).toFixed(2)
                    const y = (50 + r * Math.sin(angle)).toFixed(2)
                    pts.push(`${i === 0 ? 'M' : 'L'}${x},${y}`)
                }
                return <path d={pts.join(' ')} {...commonStrokeProps} fill="none" />
            }
            default:
                return null
        }
    }

    return (
        <div ref={ref} className={cn("relative w-full h-full", className)} style={containerStyle}>
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="xMidYMid meet"
                style={glowStyle}
            >
                {gradient && (
                    <defs>
                        {gradientType === 'linear' ? (
                            <linearGradient id={`grad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                {gradientColors.length > 1 ? gradientColors.map((c, i) => (
                                    <stop key={i} offset={`${(i / (gradientColors.length - 1)) * 100}%`} stopColor={c} />
                                )) : (
                                    <>
                                        <stop offset="0%" stopColor={gradientColors[0] || color} />
                                        <stop offset="100%" stopColor={gradientColors[0] || color} />
                                    </>
                                )}
                            </linearGradient>
                        ) : (
                            <radialGradient id={`grad-${type}`} cx="50%" cy="50%" r="50%">
                                {gradientColors.length > 1 ? gradientColors.map((c, i) => (
                                    <stop key={i} offset={`${(i / (gradientColors.length - 1)) * 100}%`} stopColor={c} />
                                )) : (
                                    <>
                                        <stop offset="0%" stopColor={gradientColors[0] || color} />
                                        <stop offset="100%" stopColor={gradientColors[0] || color} />
                                    </>
                                )}
                            </radialGradient>
                        )}
                    </defs>
                )}
                {renderShape()}
            </svg>
        </div>
    )
})

SmartShape.displayName = 'SmartShape'
