"use client"

import { useEffect, useRef } from "react"
import {
    AURORA_SHADER,
    LIQUID_SHADER,
    MESH_GRADIENT_SHADER,
    METABALLS_SHADER,
    HYPERSPEED_SHADER,
    STARS_SHADER,
    RAIN_SHADER,
    RHYTHM_SHADER,
    UNIVERSE_SHADER,
    createProgram
} from "@/lib/shaders"

const SHADER_MAP: Record<string, string> = {
    aurora: AURORA_SHADER,
    liquid: LIQUID_SHADER,
    'mesh-gradient': MESH_GRADIENT_SHADER,
    metaballs: METABALLS_SHADER,
    hyperspeed: HYPERSPEED_SHADER,
    'stars': STARS_SHADER,
    'rain': RAIN_SHADER,
    'rhythm': RHYTHM_SHADER,
    'universe': UNIVERSE_SHADER
}

interface BackgroundEffectProps {
    type: string
    primaryColor?: string
}

// Utility to convert hex to RGB for shaders
const hexToRgb = (hex: string) => {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
}

export function BackgroundEffect({ type, primaryColor = '#000000' }: BackgroundEffectProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mousePos = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY }
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || type === 'none') return

        const gl = canvas.getContext('webgl')
        if (!gl) return

        const shaderSource = SHADER_MAP[type]
        if (!shaderSource) return

        const vertexSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `

        const program = createProgram(gl, vertexSource, shaderSource)
        if (!program) return

        const positionBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0
        ]), gl.STATIC_DRAW)

        const positionLocation = gl.getAttribLocation(program, 'position')
        gl.enableVertexAttribArray(positionLocation)
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

        const iTimeLocation = gl.getUniformLocation(program, 'iTime')
        const iResolutionLocation = gl.getUniformLocation(program, 'iResolution')
        const uMouseLocation = gl.getUniformLocation(program, 'uMouse')
        const uColorLocation = gl.getUniformLocation(program, 'uColor')

        const rgb = hexToRgb(primaryColor)

        let animationFrameId: number
        const render = (time: number) => {
            if (!canvasRef.current) return

            // Handle resizing
            const rect = canvas.getBoundingClientRect()
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                canvas.width = rect.width
                canvas.height = rect.height
                gl.viewport(0, 0, canvas.width, canvas.height)
            }

            gl.useProgram(program)
            gl.uniform1f(iTimeLocation, time * 0.001)
            gl.uniform2f(iResolutionLocation, canvas.width, canvas.height)
            gl.uniform2f(uMouseLocation, mousePos.current.x, canvas.height - mousePos.current.y)
            gl.uniform3f(uColorLocation, rgb.r, rgb.g, rgb.b)

            gl.drawArrays(gl.TRIANGLES, 0, 6)
            animationFrameId = requestAnimationFrame(render)
        }

        animationFrameId = requestAnimationFrame(render)

        return () => {
            cancelAnimationFrame(animationFrameId)
            if (gl) {
                gl.deleteProgram(program)
                gl.deleteBuffer(positionBuffer)
            }
        }
    }, [type, primaryColor])

    if (!type || type === 'none') return null

    // Legacy CSS Effects (or Fallback)
    if (type === 'grid-move') {
        return (
            <div className="absolute inset-0 z-0 perspective-[500px] pointer-events-none" style={{ color: primaryColor }}>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.15] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] animate-grid-flow" />
                <style jsx>{`
                    @keyframes grid-flow {
                        0% { transform: translateY(0); }
                        100% { transform: translateY(40px); }
                    }
                    .animate-grid-flow { animation: grid-flow 2s linear infinite; }
                `}</style>
            </div>
        )
    }

    if (type === 'noise') {
        return (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.15]">
                <div className="absolute -inset-[200%] animate-noise"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        backgroundSize: '256px 256px',
                        backgroundRepeat: 'repeat'
                    }}
                />
                <style jsx>{`
                    @keyframes noise-anim {
                        0%, 100% { transform: translate(0, 0); }
                        10% { transform: translate(-5%, -10%); }
                        20% { transform: translate(-15%, 5%); }
                        30% { transform: translate(7%, -25%); }
                        40% { transform: translate(-5%, 25%); }
                        50% { transform: translate(-15%, 10%); }
                        60% { transform: translate(15%, 0%); }
                        70% { transform: translate(0%, 15%); }
                        80% { transform: translate(3%, 35%); }
                        90% { transform: translate(-10%, 10%); }
                    }
                    .animate-noise { animation: noise-anim 0.5s steps(2) infinite; }
                `}</style>
            </div>
        )
    }

    if (type === 'vintage') {
        return (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-normal">
                {/* Sepia tone base */}
                <div className="absolute inset-0 bg-[#5d4037] mix-blend-color opacity-50" />
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_150%)] mix-blend-multiply" />
                {/* Grain */}
                <div className="absolute -inset-[200%] animate-noise opacity-30 mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        backgroundSize: '256px 256px',
                        backgroundRepeat: 'repeat'
                    }}
                />
                <style jsx>{`
                    @keyframes noise-anim {
                        0%, 100% { transform: translate(0, 0); }
                        10% { transform: translate(-5%, -10%); }
                        20% { transform: translate(-15%, 5%); }
                        30% { transform: translate(7%, -25%); }
                        40% { transform: translate(-5%, 25%); }
                        50% { transform: translate(-15%, 10%); }
                        60% { transform: translate(15%, 0%); }
                        70% { transform: translate(0%, 15%); }
                        80% { transform: translate(3%, 35%); }
                        90% { transform: translate(-10%, 10%); }
                    }
                    .animate-noise { animation: noise-anim 0.5s steps(2) infinite; }
                `}</style>
            </div>
        )
    }

    // WebGL Canvas Effects
    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0 mix-blend-normal"
        />
    )
}
