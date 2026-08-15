---
name: ARC.BD Design System
description: Modern developer-first glassmorphism design system for ARC.BD
colors:
  background: "#09090b"
  foreground: "#fafafa"
  card: "#141417"
  card-foreground: "#fafafa"
  primary: "#3b82f6"
  primary-foreground: "#ffffff"
  secondary: "#1a1a1f"
  secondary-foreground: "#fafafa"
  muted: "#1a1a1f"
  muted-foreground: "#a1a1aa"
  accent: "#3b82f6"
  accent-foreground: "#ffffff"
  destructive: "#ef4444"
  destructive-foreground: "#ffffff"
  border: "#27272a"
  input: "#27272a"
  ring: "#3b82f6"
  glass-surface: "rgba(255, 255, 255, 0.03)"
  glass-border: "rgba(255, 255, 255, 0.12)"
  glass-flare: "rgba(255, 255, 255, 0.12)"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "0.875rem"
  2xl: "1rem"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  card:
    backgroundColor: "{colors.glass-surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
  card-hover:
    backgroundColor: "rgba(255, 255, 255, 0.06)"
  button-primary:
    backgroundColor: "#ffffff"
    textColor: "#09090b"
    rounded: "{rounded.full}"
    padding: "0.5rem 1rem"
---

# ARC.BD Design System

## Overview
ARC.BD employs an out-of-distribution, high-craft developer aesthetic that marries deep obsidian dark mode with liquid glassmorphism, specular top-lighting, and razor-sharp typographic hierarchy.

Key principles:
1. **Glassmorphism & Depth:** Translucent surfaces (`backdrop-blur-xl`), diagonal light sheens, and multi-layer inner specular rim lights instead of harsh opaque cards.
2. **Tactile Micro-Interactions:** Subtle hover lifts (`-translate-y-1`), border illumination shifts, and frictionless interactive pills (`rounded-full`).
3. **Surface Harmony:** The dashboard adopts deep, scan-friendly matte obsidian containers (`bg-card`), while high-visibility landing elements and floating overlays utilize glossy glassmorphism.

---

## Colors
The palette is rooted in pure pitch black (`#000000`) and deep obsidian (`#09090b`), illuminated by clean white typography, translucent specular sheens, and electric blue/emerald status accents.

- **Background:** `#09090b` (`oklch(0.1450 0 0)`)
- **Card Surface (Matte):** `#141417` (`oklch(0.1750 0 0)`)
- **Card Surface (Glass):** `rgba(255, 255, 255, 0.03)` with `backdrop-blur-xl`
- **Border Rim:** `rgba(255, 255, 255, 0.12)` (hairline translucent border)
- **Specular Flare:** `radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 255, 255, 0.12), transparent 70%)`
- **Primary Accent:** `#3b82f6` (`oklch(0.6200 0.2200 250)`)
- **Success / Operational:** `#10b981` (`emerald-400`)
- **Warning / Admin:** `#f59e0b` (`amber-400`)
- **Destructive:** `#ef4444` (`red-400`)

---

## Typography
- **Sans-serif:** System UI font stack (`Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`) optimized for high density and legibility.
- **Monospace:** `ui-monospace`, `SFMono-Regular`, `Menlo`, `Consolas` for domain strings, DNS records, IPs, and tags.
- **Tracking:** Tighter tracking (`tracking-tight` / `-0.02em`) on headlines, crisp normal tracking on body copy.

---

## Layout
- **Container Max-Widths:**
  - Landing Hero & Content: `max-w-4xl` / `max-w-6xl`
  - Dashboard Container: `max-w-7xl` with 240px responsive sidebar
- **Grid Systems:**
  - 3-Column Feature Cards: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
  - 3-Column How-it-works: `grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6`
  - Dashboard Metrics: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`

---

## Elevation & Depth
Elevation is achieved using multi-tier inner box-shadows, diagonal gradient overlays, and backdrop filters rather than flat drop shadows.

```css
/* Specular Glass Elevation */
box-shadow:
  inset 0 1px 1px 0 rgba(255, 255, 255, 0.25),
  inset 0 0 0 1px rgba(255, 255, 255, 0.06),
  0 8px 32px 0 rgba(0, 0, 0, 0.36);

/* Floating Dropdown / Drawer Elevation */
box-shadow:
  inset 0 1px 1px 0 rgba(255, 255, 255, 0.25),
  inset 0 0 0 1px rgba(255, 255, 255, 0.06),
  0 20px 48px 0 rgba(0, 0, 0, 0.70);
```

---

## Shapes
- **Cards & Panels:** `rounded-xl` (12px) to `rounded-2xl` (16px).
- **Interactive Controls:** `rounded-full` (pills) for search bars, buttons, view toggles, badges, and avatars.
- **Icon Capsules:** `rounded-lg` (8px) or `rounded-full` (pills) with translucent background `bg-white/[0.08]` and inner rim `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]`.

---

## Components

### 1. Glossy Glassmorphic Card (`Card`)
The signature component for high-polish landing page cards, floating menus, and highlight features.

#### Component Code (`src/components/ui/card.tsx`):
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, style, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      backgroundImage: "linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.02) 100%)",
      boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.06), 0 8px 32px 0 rgba(0, 0, 0, 0.36)",
      ...style,
    }}
    className={cn(
      "relative rounded-xl border border-white/[0.12] bg-white/[0.03] backdrop-blur-xl backdrop-saturate-150 text-card-foreground transition-all duration-300 group overflow-hidden hover:border-white/[0.24] hover:bg-white/[0.06]",
      className
    )}
    {...props}
  >
    {/* Specular Glossy Top Light Flare Layer */}
    <span
      className="absolute inset-0 pointer-events-none rounded-[inherit]"
      style={{
        background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 255, 255, 0.12), transparent 70%)",
      }}
    />
    <div className="relative z-10 flex flex-col h-full">{children}</div>
  </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight text-foreground", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

#### Usage Example:
```tsx
import { Card, CardContent } from "@/components/ui/card"
import { Zap } from "lucide-react"

export function FeatureCard() {
  return (
    <Card className="group p-6 rounded-xl hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-0 flex flex-col gap-3">
        <div className="size-8.5 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-zinc-300 group-hover:bg-white/[0.16] group-hover:text-white transition-all duration-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
          <Zap className="size-4" strokeWidth={1.5} />
        </div>
        <h3 className="font-semibold text-sm text-white tracking-tight">Instant Propagation</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Records sync to Cloudflare's global edge network within seconds.
        </p>
      </CardContent>
    </Card>
  )
}
```

---

### 2. Glassmorphic Dropdown Menu
Floating overlays and dropdown menus adopt the identical glass formula with higher elevation.

```tsx
<DropdownMenuContent
  align="end"
  sideOffset={8}
  style={{
    backgroundImage: "linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.02) 100%)",
    boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.06), 0 20px 48px 0 rgba(0, 0, 0, 0.7)",
  }}
  className="w-64 p-2 space-y-1 bg-[#101014]/80 backdrop-blur-2xl backdrop-saturate-150 border border-white/[0.14] rounded-2xl relative overflow-hidden text-card-foreground"
>
  <span
    className="absolute inset-0 pointer-events-none rounded-[inherit]"
    style={{
      background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 255, 255, 0.12), transparent 70%)",
    }}
  />
  <div className="relative z-10">
    {/* Dropdown items */}
  </div>
</DropdownMenuContent>
```

---

### 3. Glass Navbar Pill Capsule
```tsx
<div className="h-11 rounded-full bg-gradient-to-b from-white/[0.22] via-white/[0.08] to-white/[0.04] backdrop-blur-xl border border-white/[0.12] shadow-[inset_0_1px_1.5px_0_rgba(255,255,255,0.40),0_10px_30px_-8px_rgba(0,0,0,0.35)] px-4 flex items-center justify-between">
  {/* Nav links and brand */}
</div>
```

---

## Do's and Don'ts

### Do:
- **Do** use `backdrop-blur-xl backdrop-saturate-150` with translucent alpha fills (`bg-white/[0.03]` / `bg-[#101014]/80`) for glass components.
- **Do** apply the specular top light rim `boxShadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)` to create physical depth.
- **Do** keep action buttons, filter chips, and search bars as sleek pills (`rounded-full`).
- **Do** wrap card children in `<div className="relative z-10 ...">` to ensure clean separation from the top light flare layer.

### Don't:
- **Don't** use opaque solid background colors (e.g. `bg-[#111115]`) on cards that should be glassmorphic.
- **Don't** use generic flat grey drop shadows; always prefer layered specular inner highlights.
- **Don't** leak the glassmorphism gradient into dense data tables or dashboard control panels; dashboard overview tables stay crisp on `bg-card`.
- **Don't** omit `overflow-hidden` and `rounded-[inherit]` on absolute specular layers.
