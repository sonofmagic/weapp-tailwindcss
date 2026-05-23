const VITE_GENERATED_CSS_MARKER_RE = /\/\*!\s*weapp-tailwindcss vite-generated-css(?::[^\s*]+)?\s*\*\/\s*/i
const VITE_GENERATED_CSS_MARKER_GLOBAL_RE = /\/\*!\s*weapp-tailwindcss vite-generated-css(?::[^\s*]+)?\s*\*\/\s*/gi

export function createViteGeneratedCssMarker(file: string) {
  return `/*! weapp-tailwindcss vite-generated-css:${encodeURIComponent(file)} */`
}

export function hasViteGeneratedCssMarker(source: unknown) {
  return typeof source === 'string' && VITE_GENERATED_CSS_MARKER_RE.test(source)
}

export function stripViteGeneratedCssMarkers(source: string) {
  return source.replace(VITE_GENERATED_CSS_MARKER_GLOBAL_RE, '')
}
