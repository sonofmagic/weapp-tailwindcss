const BUNDLER_GENERATED_CSS_MARKER_RE = /\/\*!\s*weapp-tailwindcss (?:vite|webpack)-generated-css(?::[^\s*]+)?\s*\*\/\s*/i
const BUNDLER_GENERATED_CSS_MARKER_GLOBAL_RE = /\/\*!\s*weapp-tailwindcss (?:vite|webpack)-generated-css(?::[^\s*]+)?\s*\*\/\s*/gi

export function createBundlerGeneratedCssMarker(bundler: 'vite' | 'webpack', file: string) {
  return `/*! weapp-tailwindcss ${bundler}-generated-css:${encodeURIComponent(file)} */`
}

export function hasBundlerGeneratedCssMarker(source: unknown) {
  return typeof source === 'string' && BUNDLER_GENERATED_CSS_MARKER_RE.test(source)
}

export function stripBundlerGeneratedCssMarkers(source: string) {
  return source.replace(BUNDLER_GENERATED_CSS_MARKER_GLOBAL_RE, '')
}
