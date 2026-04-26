"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: string
  side?: "top" | "bottom" | "left" | "right"
  className?: string
}

export function MinimalTooltip({ 
  children, 
  content, 
  side = "top",
  className 
}: TooltipProps) {
  const [show, setShow] = React.useState(false)

  const sideStyles = {
    top: "-top-10 left-1/2 -translate-x-1/2 mb-2",
    bottom: "-bottom-10 left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: side === 'top' ? 5 : -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: side === 'top' ? 5 : -5 }}
            className={cn(
              "absolute z-[9999] px-3 py-1.5 rounded-none bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[8px] font-black uppercase tracking-[0.2em] whitespace-nowrap pointer-events-none shadow-xl border border-white/10 dark:border-zinc-900/10",
              sideStyles[side],
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
