import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 hover:brightness-[120%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none border-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-emerald-500 to-emerald-700 text-white shadow-[inset_0_1.5px_0px_0_rgba(255,255,255,0.35),0_2px_8px_rgba(16,185,129,0.3)]",
        emerald:
          "bg-gradient-to-b from-emerald-500 to-emerald-700 text-white shadow-[inset_0_1.5px_0px_0_rgba(255,255,255,0.35),0_2px_8px_rgba(16,185,129,0.3)]",
        dark:
          "bg-gradient-to-b from-[#2d2d30] to-[#18181b] text-white shadow-[inset_0_1.5px_0px_0_rgba(255,255,255,0.25),0_2px_6px_rgba(0,0,0,0.5)]",
        destructive:
          "bg-gradient-to-b from-red-500 to-red-700 text-white shadow-[inset_0_1.5px_0px_0_rgba(255,255,255,0.3),0_2px_8px_rgba(239,68,68,0.3)]",
        outline:
          "bg-gradient-to-b from-white/10 to-white/5 border border-white/15 text-white shadow-[inset_0_1px_0px_0_rgba(255,255,255,0.2)]",
        secondary:
          "bg-gradient-to-b from-[#2d2d30] to-[#18181b] text-white shadow-[inset_0_1.5px_0px_0_rgba(255,255,255,0.25),0_2px_6px_rgba(0,0,0,0.4)]",
        ghost:
          "hover:bg-white/10 hover:text-foreground active:scale-95 transition-all",
        link: "text-emerald-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
