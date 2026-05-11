export const TAILWIND_V4_BANNER_RE = /\/\*!\s*tailwindcss v4\./
export const TAILWIND_GENERATED_CSS_MARKER_RE = /\/\*!\s*tailwindcss v|@property\s+--tw-|--tw-|:not\(#\\#\)|\.[^,{]*(?:\\:|\\\[|\\#)|(?::host|page|\.tw-root|wx-root-portal-content)[^{]*\{[^}]*--(?:color|spacing|text|font-weight|radius)-/
export const GENERATOR_PLACEHOLDER_MARKER_RE = /\/\*!\s*weapp-tailwindcss generator-placeholder\s*\*\//i
export const GENERATOR_PLACEHOLDER_MARKER_GLOBAL_RE = /\/\*!\s*weapp-tailwindcss generator-placeholder\s*\*\/\s*/gi
export const TAILWIND_BANNER_PREFIX_RE = /^\/\*!\s*tailwindcss v[^*]*\*\/\s*/i
export const TAILWIND_BANNER_RE = /\/\*!\s*tailwindcss v[^*]*\*\//i
export const TAILWIND_BANNER_GLOBAL_RE = /\/\*!\s*tailwindcss v[^*]*\*\/\s*/gi
export const VITE_MARKER_RE = /\/\*\$vite\$:[^*]*\*\//g

export function createCssAppend(base: string, extra: string) {
  if (!base) {
    return extra
  }
  if (!extra) {
    return base
  }
  return `${base}\n${extra}`
}

export function splitTailwindV4GeneratedCss(rawSource: string, rawTailwindCss: string) {
  const trimmedRaw = rawSource.trim()
  const trimmedTailwind = rawTailwindCss.trim()
  if (trimmedRaw === trimmedTailwind) {
    return ''
  }
  if (trimmedTailwind.startsWith(trimmedRaw)) {
    return ''
  }

  const start = rawSource.indexOf(rawTailwindCss)
  if (start === -1) {
    return
  }

  return createCssAppend(
    rawSource.slice(0, start),
    rawSource.slice(start + rawTailwindCss.length),
  )
}

export function removeTailwindGeneratedCssByBanner(rawSource: string) {
  const match = TAILWIND_BANNER_RE.exec(rawSource)
  if (!match || match.index === undefined) {
    return
  }
  const before = rawSource.slice(0, match.index)
  const after = rawSource.slice(match.index)
  const viteMarkers = [...after.matchAll(VITE_MARKER_RE)]
    .map(item => item[0])
    .join('\n')
  return createCssAppend(before, viteMarkers)
}

export function stripTailwindBanner(css: string) {
  return css.replace(TAILWIND_BANNER_PREFIX_RE, '')
}

export function stripTailwindBanners(css: string) {
  return css.replace(TAILWIND_BANNER_GLOBAL_RE, '')
}

export function stripGeneratorPlaceholderMarkers(css: string) {
  return css.replace(GENERATOR_PLACEHOLDER_MARKER_GLOBAL_RE, '')
}

export function hasTailwindGeneratedCss(rawSource: string) {
  return TAILWIND_V4_BANNER_RE.test(rawSource)
}

export function hasTailwindGeneratedCssMarkers(rawSource: string) {
  return TAILWIND_GENERATED_CSS_MARKER_RE.test(rawSource)
    || GENERATOR_PLACEHOLDER_MARKER_RE.test(rawSource)
}
