"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: string
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  className?: string
}

export function MinimalTooltip({ 
  children, 
  content, 
  side = "top",
  align = "center",
  className 
}: TooltipProps) {
  const [show, setShow] = React.useState(false)

  let alignStyle = ""
  if (side === "top" || side === "bottom") {
    if (align === "center") alignStyle = "left-1/2 -translate-x-1/2"
    if (align === "start") alignStyle = "left-0"
    if (align === "end") alignStyle = "right-0"
  } else {
    alignStyle = "top-1/2 -translate-y-1/2"
  }

  const sideStyles = {
    top: `-top-10 mb-2 ${alignStyle}`,
    bottom: `-bottom-10 mt-2 ${alignStyle}`,
    left: `right-full mr-2 ${alignStyle}`,
    right: `left-full ml-2 ${alignStyle}`,
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
