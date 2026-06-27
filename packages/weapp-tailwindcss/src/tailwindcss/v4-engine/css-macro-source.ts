import type { TailwindV4ResolvedSource } from './types'
import { transformCssMacroTailwindV4Source } from '@/css-macro/auto'

export function resolveCssMacroTailwindV4Source(source: TailwindV4ResolvedSource) {
  const css = transformCssMacroTailwindV4Source(source.css)
  return css === source.css ? source : { ...source, css }
}
