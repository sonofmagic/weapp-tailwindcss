import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors", {
    variants: {
      variant: {
        subtle: "bg-muted text-muted-foreground",
        brand: "bg-primary text-primary-foreground border-primary/40",
        success: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-200 dark:border-emerald-500/40",
        warning: "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-100 dark:border-amber-500/40",
        outline: "bg-background text-foreground",
      },
      tone: {
        solid: "shadow-xs",
        ghost: "bg-transparent border-dashed",
      },
    },
    compoundVariants: [
      { variant: "brand", tone: "ghost", class: "text-primary border-primary/50 bg-primary/5" },
      { variant: "outline", tone: "ghost", class: "border-border text-muted-foreground" },
      { variant: "brand", tone: "solid", class: "shadow-sm" },
    ],
    defaultVariants: {
      variant: "subtle",
      tone: "solid",
    },
  }
)

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

function Badge({ className, variant, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, tone }), className)} {...props} />
}

export { Badge }
