import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, style, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      backgroundImage: "linear-gradient(180deg, rgba(30, 30, 35, 0.8), rgba(18, 18, 22, 0.6))",
      ...style,
    }}
    className={cn(
      "relative rounded-2xl border border-white/10 bg-card text-card-foreground shadow-[inset_0_1.5px_0px_0_rgba(255,255,255,0.12),0_4px_12px_rgba(0,0,0,0.4)] backdrop-blur-md hover:border-white/25 hover:shadow-[inset_0_1.5px_0px_0_rgba(255,255,255,0.25),0_6px_20px_rgba(0,0,0,0.6)] transition-all duration-300 group overflow-hidden",
      className
    )}
    {...props}
  >
    {/* Blended Top Light Rim Layer */}
    <span
      className="absolute inset-0 pointer-events-none rounded-[inherit]"
      style={{ boxShadow: "inset 0 1.5px 0px 0 rgba(255, 255, 255, 0.15)" }}
    />
    <div className="relative z-10">{children}</div>
  </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
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
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
