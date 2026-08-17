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
          "radial-gradient(ellipse 90% 65% at 50% -10%, rgba(255, 255, 255, 0.08), rgba(9, 9, 11, 0.98))",
      }}
    />
  )

  return (
    <div
      className={`pointer-events-none select-none overflow-hidden ${className ?? ""}`}
      aria-hidden="true"
    >
      {/* Base Monochromatic Ambient Glow Beams */}
      <div className="absolute inset-0 w-full h-full opacity-60">
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[110px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.10) 0%, rgba(161, 161, 170, 0.06) 45%, rgba(39, 39, 42, 0.03) 70%, transparent 100%)",
          }}
        />
      </div>

      {/* WebGL Mesh Gradient Layer - Monochromatic Gray & Black */}
      <WebGLErrorBoundary fallback={cssFallback}>
        {hasWebGL ? (
          <DynamicMeshGradient
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.85 }}
            colors={[
              "#000000", // pure void black base
              "#09090b", // dark obsidian
              "#18181b", // zinc 900 charcoal
              "#27272a", // zinc 800 dark slate gray
              "#52525b", // zinc 600 specular gray highlight
            ]}
            speed={0.22}
            frame={9500}
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

