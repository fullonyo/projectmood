"use client"

import { useEffect, useRef } from 'react'

interface MouseTrailsProps {
    type: string
}

export function MouseTrails({ type }: MouseTrailsProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!type || type === 'none') return
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let particles: Particle[] = []
        let mouse = { x: 0, y: 0 }

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        window.addEventListener('resize', resize)
        resize()

        class Particle {
            x: number
            y: number
            size: number
            speedX: number
            speedY: number
            color: string
            life: number

            constructor(x: number, y: number, type: string) {
                this.x = x
                this.y = y
                this.life = 1.0

                if (type === 'sparkles') {
                    this.size = Math.random() * 3 + 1
                    this.speedX = Math.random() * 2 - 1
                    this.speedY = Math.random() * 2 - 1
                    this.color = `hsl(${Math.random() * 60 + 40}, 100%, 70%)` // Gold/Yellow
                } else if (type === 'ghost') {
                    this.size = Math.random() * 10 + 5
                    this.speedX = Math.random() * 1 - 0.5
                    this.speedY = Math.random() * -1 - 0.5 // Float up
                    this.color = `rgba(255, 255, 255, 0.5)`
                } else if (type === 'pixel-dust') {
                    this.size = 4
                    this.speedX = 0
                    this.speedY = 0
                    this.color = `hsl(${Math.random() * 360}, 80%, 60%)`
                } else {
                    this.size = 2
                    this.speedX = 0
                    this.speedY = 0
                    this.color = 'white'
                }
            }

            update() {
                this.x += this.speedX
                this.y += this.speedY
                this.life -= 0.02
                if (this.life < 0) this.life = 0
            }

            draw() {
                if (!ctx) return
                ctx.globalAlpha = this.life
                ctx.fillStyle = this.color

                if (type === 'pixel-dust') {
                    ctx.fillRect(this.x, this.y, this.size, this.size)
                } else {
                    ctx.beginPath()
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                    ctx.fill()
                }
                ctx.globalAlpha = 1.0
            }
        }

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX
            mouse.y = e.clientY

            // Create particles
            for (let i = 0; i < 2; i++) {
                particles.push(new Particle(mouse.x, mouse.y, type))
            }
        }

        window.addEventListener('mousemove', handleMouseMove)

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            for (let i = 0; i < particles.length; i++) {
                particles[i].update()
                particles[i].draw()

                if (particles[i].life <= 0) {
                    particles.splice(i, 1)
                    i--
                }
            }

            animationFrameId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [type])

    if (!type || type === 'none') return null

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9999]"
        />
    )
}
