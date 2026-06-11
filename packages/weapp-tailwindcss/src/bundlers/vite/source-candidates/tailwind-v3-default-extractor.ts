import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const TAILWIND_V3_HTML_TOKEN_CANDIDATES = new Set([
  '/block',
  '/div',
  '/span',
  '/template',
  '/text',
  '/view',
  'class',
  'className',
  'div',
  'hover-class',
  'span',
  'template',
  'text',
  'view',
])

export function createTailwindV3DefaultExtractor() {
  try {
    const defaultExtractorModule = require('tailwindcss/lib/lib/defaultExtractor')
    const resolveConfigModule = require('tailwindcss/resolveConfig')
    const resolveConfig = resolveConfigModule.default ?? resolveConfigModule
    const defaultExtractor = defaultExtractorModule.defaultExtractor ?? defaultExtractorModule.default ?? defaultExtractorModule
    const extractor = defaultExtractor({
      tailwindConfig: resolveConfig({ content: [] }),
    })
    return (source: string) => new Set<string>(
      extractor(source).filter((candidate: string) => !TAILWIND_V3_HTML_TOKEN_CANDIDATES.has(candidate)),
    )
  }
  catch {
    return undefined
  }
}
