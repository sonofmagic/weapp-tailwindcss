import * as React from "react"

import { cn } from "@/lib/utils"

const inputBase =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => {
    return <input type={type} className={cn(inputBase, className)} ref={ref} {...props} />
  }
)
Input.displayName = "Input"

export { Input }
