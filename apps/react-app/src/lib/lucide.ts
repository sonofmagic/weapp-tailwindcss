import type { ComponentType } from "react"
import type { LucideIcon, LucideProps } from "lucide-react"

// React 19 JSX expects components to return ReactNode | Promise<ReactNode>.
// Cast lucide-react icons once to keep call sites tidy and type-safe.
export const toIconComponent = (Icon: LucideIcon): ComponentType<LucideProps> =>
  Icon as unknown as ComponentType<LucideProps>
