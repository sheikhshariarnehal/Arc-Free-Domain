import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-95 hover:brightness-[120%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none border-none overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "text-white shadow-[0_0px_0px_-2px_rgba(0,0,0,0.5)]",
        emerald:
          "text-white shadow-[0_0px_0px_-2px_rgba(0,0,0,0.5)]",
        dark:
          "text-white shadow-[0_0px_0px_-2px_rgba(0,0,0,0.5)]",
        destructive:
          "text-white shadow-[0_0px_0px_-2px_rgba(0,0,0,0.5)]",
        outline:
          "border border-white/15 text-white shadow-[0_0px_0px_-2px_rgba(0,0,0,0.5)]",
        secondary:
          "text-white shadow-[0_0px_0px_-2px_rgba(0,0,0,0.5)]",
        ghost:
          "hover:bg-white/10 hover:text-foreground active:scale-95 transition-all",
        link: "text-emerald-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2 text-sm rounded-full",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-8 text-base",
        hero: "h-12 px-8 py-3 rounded-full text-base font-semibold",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  gradientStyle?: string
  rimOpacity?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    // Default gradient backgrounds matching skeuomorphic spec
    let bgStyle: React.CSSProperties = {
      backgroundImage: "linear-gradient(180deg, #10b981, #047857)",
    }

    if (variant === "dark" || variant === "secondary") {
      bgStyle = {
        backgroundImage: "linear-gradient(180deg, #2d2d30, #18181b)",
      }
    } else if (variant === "destructive") {
      bgStyle = {
        backgroundImage: "linear-gradient(180deg, #ef4444, #b91c1c)",
      }
    } else if (variant === "outline") {
      bgStyle = {
        backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))",
      }
    }

    const mergedStyle = { ...bgStyle, ...style }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={mergedStyle}
        ref={ref}
        {...props}
      >
        {/* Blended Top Light Rim Layer */}
        {variant !== "ghost" && variant !== "link" && (
          <span
            className="absolute inset-0 pointer-events-none rounded-[inherit]"
            style={{
              boxShadow: "inset 0 1.5px 0px 0 rgba(255, 255, 255, 0.25)",
            }}
          />
        )}

        {/* Content Z-Layer */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
