"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import dynamic from "next/dynamic"

/**
 * Safely test if WebGL context is operational in the current browser environment.
 */
function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false
  try {
    const canvas = document.createElement("canvas")
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    return !!gl
  } catch {
    return false
  }
}

/**
 * Error Boundary to catch any WebGL execution errors thrown by canvas libraries.
 */
class WebGLErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.warn("WebGL Shader context unavailable; using CSS ambient glow fallback:", error?.message)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

/**
 * Dynamically load MeshGradient only on client after WebGL verification.
 */
const DynamicMeshGradient = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => mod.MeshGradient),
  { ssr: false }
)

const letterAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const containerAnimation = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
}

/**
 * ShaderHeroBg — Visible 3D Glossy Dark-Mode MeshGradient Background.
 */
export function ShaderHeroBg({ className }: { className?: string }) {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null)

  useEffect(() => {
    setHasWebGL(checkWebGLSupport())
  }, [])

  const cssFallback = (
    <div
      className="absolute inset-0 w-full h-full"
      style={{
        background:
          "radial-gradient(ellipse 90% 65% at 50% -10%, rgba(59, 130, 246, 0.25), rgba(9, 9, 11, 0.98))",
      }}
    />
  )

  return (
    <div
      className={`pointer-events-none select-none overflow-hidden ${className ?? ""}`}
      aria-hidden="true"
    >
      {/* Base Ambient Glow Beams */}
      <div className="absolute inset-0 w-full h-full opacity-60">
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[110px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.3) 0%, rgba(99, 102, 241, 0.2) 45%, rgba(30, 27, 75, 0.15) 70%, transparent 100%)",
          }}
        />
      </div>

      {/* WebGL Mesh Gradient Layer */}
      <WebGLErrorBoundary fallback={cssFallback}>
        {hasWebGL ? (
          <DynamicMeshGradient
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.85 }}
            colors={[
              "#000000", // void black base
              "#09090b", // dark obsidian
              "#141724", // deep slate navy
              "#252a3d", // 3D glossy wave
              "#3b82f6", // electric blue specular crest
            ]}
            speed={0.22}
            distortion={0.75}
            swirl={0.14}
            grainOverlay={0.02}
          />
        ) : (
          cssFallback
        )}
      </WebGLErrorBoundary>

      {/* Bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 h-80 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, var(--background) 100%)",
        }}
      />
    </div>
  )
}

/**
 * Full Component — Dark Mode Blended Shader Hero with Animated Letter Stagger.
 */
export const Component = ({
  title = "Elevate Your Experience",
  subtitle = "A timeless dark aesthetic, crafted for creators who seek elegance, clarity, and impact in every detail.",
  badge = "A Minimalist Future",
  ctaText = "Get Started",
  onCtaClick,
}: {
  title?: string
  subtitle?: string
  badge?: string
  ctaText?: string
  onCtaClick?: () => void
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [, setIsActive] = useState(false)

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }
    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#09090b] text-white relative overflow-hidden w-full flex flex-col items-center justify-center"
    >
      {/* SVG Glass Effect Filter */}
      <svg className="absolute inset-0 w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.004" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.25" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  
  0 1 0 0 0
  0 0 1 0 0
  0 0 0 0.9 0"
              result="tint"
            />
          </filter>
        </defs>
      </svg>

      {/* Dark Mode Mesh Gradient Background Layer */}
      <ShaderHeroBg className="absolute inset-0 z-0 h-full w-full" />

      {/* Hero Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-4 py-16 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-6 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium flex items-center gap-2 backdrop-blur-lg border border-white/20 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          {badge}
        </motion.div>

        <motion.h1
          variants={containerAnimation}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg flex flex-wrap justify-center"
        >
          {title.split("").map((char, index) => (
            <motion.span
              key={index}
              variants={letterAnimation}
              className={char === " " ? "w-3" : ""}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-zinc-300 font-normal leading-relaxed"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="mt-10 flex gap-4"
        >
          <Button
            size="lg"
            onClick={onCtaClick}
            className="rounded-2xl px-6 py-6 text-base sm:text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-98 cursor-pointer"
          >
            {ctaText} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default Component
