import { VITE_MARKER_RE } from './markers'

export {
  collectDedupedPostTransformCompatCss,
  collectGeneratedSelectors,
  normalizeCompatSelectors,
  removeGeneratedSelectorCompatCss,
} from '@weapp-tailwindcss/postcss'

export function removeDuplicatedViteMarkers(css: string, baseCss: string) {
  if (!VITE_MARKER_RE.test(baseCss)) {
    return css
  }
  VITE_MARKER_RE.lastIndex = 0
  return css.replace(VITE_MARKER_RE, '')
}
