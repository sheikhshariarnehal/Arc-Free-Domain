import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:bg-primary/90",
        secondary:
          "border-white/[0.08] bg-white/[0.06] text-secondary-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] hover:bg-white/[0.10]",
        destructive:
          "border-destructive/30 bg-destructive/15 text-destructive shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] hover:bg-destructive/25",
        outline: "border-white/[0.14] text-foreground bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
