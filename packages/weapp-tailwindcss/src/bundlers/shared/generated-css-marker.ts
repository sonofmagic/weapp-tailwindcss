const BUNDLER_GENERATED_CSS_MARKER_RE = /\/\*!?\s*weapp-tailwindcss (?:vite|webpack)-generated-css(?:\s*:\s*[^\s*]+)?\s*\*\/\s*/i
const BUNDLER_GENERATED_CSS_MARKER_GLOBAL_RE = /\/\*!?\s*weapp-tailwindcss (?:vite|webpack)-generated-css(?:\s*:\s*[^\s*]+)?\s*\*\/\s*/gi
const BUNDLER_GENERATED_CSS_MARKER_CAPTURE_RE = /\/\*!?\s*weapp-tailwindcss (vite|webpack)-generated-css(?:\s*:\s*([^\s*]+))?\s*\*\/\s*/gi
const VITE_INTERNAL_CSS_MARKER_GLOBAL_RE = /\/\*\$vite\$:\d+\*\/\s*/g

export interface BundlerGeneratedCssMarkerBlock {
  bundler: 'vite' | 'webpack'
  file?: string | undefined
  css: string
}

export function createBundlerGeneratedCssMarker(bundler: 'vite' | 'webpack', file: string) {
  return `/*! weapp-tailwindcss ${bundler}-generated-css:${encodeURIComponent(file)} */`
}

export function hasBundlerGeneratedCssMarker(source: unknown) {
  return typeof source === 'string' && BUNDLER_GENERATED_CSS_MARKER_RE.test(source)
}

export function stripBundlerGeneratedCssMarkers(source: string) {
  return source
    .replace(BUNDLER_GENERATED_CSS_MARKER_GLOBAL_RE, '')
    .replace(VITE_INTERNAL_CSS_MARKER_GLOBAL_RE, '')
}

export function parseBundlerGeneratedCssMarkerBlocks(source: string): BundlerGeneratedCssMarkerBlock[] {
  const blocks: BundlerGeneratedCssMarkerBlock[] = []
  BUNDLER_GENERATED_CSS_MARKER_CAPTURE_RE.lastIndex = 0
  let match = BUNDLER_GENERATED_CSS_MARKER_CAPTURE_RE.exec(source)
  while (match !== null) {
    const cssStart = BUNDLER_GENERATED_CSS_MARKER_CAPTURE_RE.lastIndex
    const nextMatch = BUNDLER_GENERATED_CSS_MARKER_CAPTURE_RE.exec(source)
    const cssEnd = nextMatch?.index ?? source.length
    const file = match[2] ? decodeURIComponent(match[2]) : undefined
    blocks.push({
      bundler: match[1] as 'vite' | 'webpack',
      file,
      css: source.slice(cssStart, cssEnd),
    })
    match = nextMatch
  }
  return blocks
}
