import { analyzeApplyOnlySource } from '@weapp-tailwindcss/postcss'
import { hasTailwindApplyDirective, hasTailwindRootDirectives } from '../directives'

export { filterTailwindV4ApplyOnlyGeneratedCss as filterApplyOnlyGeneratedCss, normalizeEmptyTailwindCustomVariants } from '@weapp-tailwindcss/postcss'

export function shouldFilterApplyOnlyGeneratedCss(
  _majorVersion: number | undefined,
  target: string,
  source: string,
  options: {
    hasGeneratedCss: boolean
    hasGeneratedMarkers: boolean
  },
) {
  const eligible = (target === 'weapp' || target === 'web')
    && hasTailwindApplyDirective(source)
    && !hasTailwindRootDirectives(source)
    && !options.hasGeneratedCss
    && !options.hasGeneratedMarkers
  if (!eligible) {
    return false
  }
  const analysis = analyzeApplyOnlySource(source)
  return analysis.selectors.size > 0 && analysis.onlyApply
}
