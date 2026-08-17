"use client"

import { MeshGradient } from "@paper-design/shaders-react"

/**
 * ShaderHeroBg — Visible 3D Glossy Liquid Obsidian Background.
 *
 * Balanced color palette: pitch black base with visible dark slate & silver-blue
 * glossy specular highlights (#1c1d2a to #383a52) so the 3D liquid motion is
 * clearly visible and striking while maintaining a sleek dark mode aesthetic.
 */
export function ShaderHeroBg({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none select-none overflow-hidden ${className ?? ""}`}
      aria-hidden="true"
    >
      {/* ── Primary 3D Mesh Gradient ── */}
      <MeshGradient
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.95 }}
        colors={[
          "#040406", // void black base
          "#0f1017", // midnight shadow
          "#1a1c27", // dark slate body
          "#2c2f42", // visible 3D liquid wave
          "#3a3d54", // bright glossy specular crest peak
        ]}
        speed={0.22}
        distortion={0.75}
        swirl={0.14}
        grainOverlay={0.02}
      />

      {/* Bottom fade — smoothly dissolves into the page background */}
      <div
        className="absolute inset-x-0 bottom-0 h-80 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, var(--background) 100%)",
        }}
      />
    </div>
  )
}
