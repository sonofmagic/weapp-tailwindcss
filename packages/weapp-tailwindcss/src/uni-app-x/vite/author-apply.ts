import { retainUniAppXAuthorApplyCss as retainAuthorApplyCss } from '@weapp-tailwindcss/postcss/transform'
import { removeTailwindSourceDirectives } from '@/bundlers/shared/generator-css/directives'

export function retainUniAppXAuthorApplyCss(
  generatedCss: string,
  authorCss: string,
  options?: { preserveRuntimeProperties?: boolean },
) {
  return retainAuthorApplyCss(
    generatedCss,
    removeTailwindSourceDirectives(authorCss, { importFallback: true }),
    options,
  )
}
