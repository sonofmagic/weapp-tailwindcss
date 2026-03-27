import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Moon,
  Palette,
  Sparkles,
  Sun,
  Table2,
  Wand2,
} from "lucide-react"
import { createElement, type SVGProps } from "react"

import { toIconComponent } from "@/lib/lucide"

export const ActivityIcon = toIconComponent(Activity)
export const ArrowUpRightIcon = toIconComponent(ArrowUpRight)
export const CheckCircle2Icon = toIconComponent(CheckCircle2)
export const Code2Icon = toIconComponent(Code2)
export const MoonIcon = toIconComponent(Moon)
export const PaletteIcon = toIconComponent(Palette)
export const SparklesIcon = toIconComponent(Sparkles)
export const SunIcon = toIconComponent(Sun)
export const Table2Icon = toIconComponent(Table2)
export const Wand2Icon = toIconComponent(Wand2)

export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true",
      ...props,
    },
    createElement("path", {
      d: "M12 .5C5.65.5.5 5.66.5 12.03c0 5.1 3.3 9.43 7.88 10.95.58.11.79-.25.79-.56 0-.28-.01-1.2-.02-2.18-3.2.7-3.88-1.38-3.88-1.38-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.15.08 1.76 1.2 1.76 1.2 1.03 1.78 2.69 1.27 3.34.97.1-.75.4-1.27.72-1.57-2.56-.29-5.25-1.29-5.25-5.74 0-1.27.45-2.3 1.19-3.11-.12-.3-.52-1.5.11-3.13 0 0 .97-.31 3.18 1.19a10.9 10.9 0 0 1 5.8 0c2.2-1.5 3.17-1.19 3.17-1.19.64 1.63.24 2.83.12 3.13.74.81 1.19 1.84 1.19 3.11 0 4.46-2.7 5.44-5.28 5.73.42.36.78 1.06.78 2.14 0 1.55-.02 2.8-.02 3.18 0 .31.2.68.8.56A11.54 11.54 0 0 0 23.5 12.03C23.5 5.66 18.35.5 12 .5Z",
    }),
  )
}
