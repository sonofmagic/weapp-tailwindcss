import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { InternalUserDefinedOptions } from '@/types'
import { filterExistingCssRules } from '@weapp-tailwindcss/postcss'
import { removeUnsupportedMiniProgramAtRules } from '../../css-cleanup'
import { removeTailwindSourceDirectives } from '../directives'
import { removeTailwindApplyAtRules } from './at-rules'
import { removeTailwindV4GeneratedUserCssArtifacts } from './generated-cleanup'
import { collectBareSelectorUserCss, isCommentOnlyCss, removeProcessedMiniProgramUnsupportedCss, removeTailwindV4GeneratorAtRules, stripTailwindSourceMediaFragments, stripUnmatchedTailwindSourceMediaCloseFragments, unwrapMiniProgramCascadeLayers } from './source-fragments'

export async function transformGeneratorUserCss(
  source: string,
  options: {
    generatorTarget: string
    generatorStyleOptions: Partial<IStyleHandlerOptions>
    cssUserHandlerOptions: IStyleHandlerOptions
    styleHandler: InternalUserDefinedOptions['styleHandler']
    importFallback: boolean
    processed?: boolean | undefined
  },
) {
  if (source.trim().length === 0) {
    return ''
  }
  if (options.processed) {
    const cleanedSource = options.generatorTarget === 'weapp'
      ? removeTailwindV4GeneratedUserCssArtifacts(
          unwrapMiniProgramCascadeLayers(
            removeProcessedMiniProgramUnsupportedCss(source, {
              ...options.generatorStyleOptions,
              ...options.cssUserHandlerOptions,
            }),
          ),
        )
      : source
    return stripUnmatchedTailwindSourceMediaCloseFragments(
      stripTailwindSourceMediaFragments(
        removeTailwindV4GeneratorAtRules(cleanedSource),
      ),
    )
  }
  const repairedSource = stripUnmatchedTailwindSourceMediaCloseFragments(
    stripTailwindSourceMediaFragments(source),
  )
  const cleanedSource = removeTailwindSourceDirectives(
    removeTailwindV4GeneratorAtRules(repairedSource),
    {
      importFallback: options.importFallback,
    },
  )
  if (cleanedSource.trim().length === 0) {
    return ''
  }
  const sanitizedSource = removeTailwindSourceDirectives(
    stripUnmatchedTailwindSourceMediaCloseFragments(
      stripTailwindSourceMediaFragments(
        options.generatorTarget === 'weapp'
          ? removeTailwindV4GeneratedUserCssArtifacts(removeUnsupportedMiniProgramAtRules(unwrapMiniProgramCascadeLayers(cleanedSource)))
          : cleanedSource,
      ),
    ),
    {
      importFallback: options.importFallback,
    },
  )
  const userSource = stripUnmatchedTailwindSourceMediaCloseFragments(removeTailwindApplyAtRules(sanitizedSource))
  if (userSource.trim().length === 0) {
    return ''
  }
  if (isCommentOnlyCss(userSource)) {
    return userSource
  }
  if (options.generatorTarget !== 'weapp') {
    return userSource
  }
  const { css } = await options.styleHandler(userSource, {
    ...options.generatorStyleOptions,
    ...options.cssUserHandlerOptions,
  })
  const transformedCss = removeTailwindV4GeneratedUserCssArtifacts(removeUnsupportedMiniProgramAtRules(css))
  const bareSelectorUserCss = collectBareSelectorUserCss(userSource)
  const missingBareSelectorUserCss = bareSelectorUserCss.trim().length > 0
    ? filterExistingCssRules(transformedCss, bareSelectorUserCss)
    : ''
  return missingBareSelectorUserCss.trim().length > 0
    ? `${transformedCss}\n${missingBareSelectorUserCss}`
    : transformedCss
}
