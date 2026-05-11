"use client"

import { useEffect, useRef } from "react"
import {
    AURORA_SHADER,
    LIQUID_SHADER,
    METABALLS_SHADER,
    STARS_SHADER,
    UNIVERSE_SHADER,
    createProgram
} from "@/lib/shaders"
import DotField from "@/components/react-bits/DotField"
import { REACT_BITS_CONFIG } from "@/lib/react-bits"

const SHADER_MAP: Record<string, string> = {
    aurora: AURORA_SHADER,
    liquid: LIQUID_SHADER,
    metaballs: METABALLS_SHADER,
    'stars': STARS_SHADER,
    'universe': UNIVERSE_SHADER
}

interface BackgroundEffectProps {
    type: string
    primaryColor?: string
    showDots?: boolean
}

const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
}

export function BackgroundEffect({ 
    type, 
    primaryColor = '#000000',
    showDots = true 
}: BackgroundEffectProps) {
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

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            {/* Camada 0: WebGL (Aurora, Liquid, etc) */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
            />

            {/* Camada 1: Interação Física (ReactBits DotField) */}
            {showDots && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                    <DotField 
                        {...REACT_BITS_CONFIG.dotField.defaults}
                    />
                </div>
            )}

            {/* Efeitos Legados */}
            {type === 'grid-move' && (
                <div className="absolute inset-0 z-0 perspective-[500px] pointer-events-none" style={{ color: primaryColor }}>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.15] animate-grid-flow" />
                </div>
            )}
        </div>
    )
}
