import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss'
import type { TransformOptions, Warning } from 'lightningcss'
import type { SelectorTransformContext } from './style-handler/selector-transform'
import { Buffer } from 'node:buffer'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import { transform } from 'lightningcss'
import { createRootSpecificityReplacer, prepareStyleOptions } from './style-handler/options'
import { buildChildCombinatorReplacement, createVisitor } from './style-handler/selector-transform'

const textDecoder = new TextDecoder()
const defaultLightningFilename = 'inline.css'
type CustomAtRules = Record<string, never>

export interface LightningcssStyleHandlerResult {
  code: string
  map?: string
  warnings: Warning[]
}

export interface LightningcssTransformConfig {
  filename?: string
  transformOptions?: Omit<TransformOptions<CustomAtRules>, 'filename' | 'code' | 'visitor'>
}

interface LightningcssStyleHandler {
  (rawSource: string, overrideOptions?: Partial<IStyleHandlerOptions>): Promise<LightningcssStyleHandlerResult>
}

export function createLightningcssStyleHandler(
  options?: Partial<IStyleHandlerOptions>,
  config: LightningcssTransformConfig = {},
): LightningcssStyleHandler {
  const cachedOptions = prepareStyleOptions(options)
  const { transformOptions, filename } = config
  const transformOverrides = transformOptions ?? {}

  return async (rawSource, overrideOptions) => {
    const resolvedOptions = prepareStyleOptions(
      defuOverrideArray<IStyleHandlerOptions, Partial<IStyleHandlerOptions>[]>(
        overrideOptions as IStyleHandlerOptions,
        cachedOptions,
      ),
    )

    const ctx: SelectorTransformContext = {
      options: resolvedOptions,
      childCombinatorReplacement: buildChildCombinatorReplacement(resolvedOptions),
    }

    const visitor = createVisitor(ctx)
    const lightningResult = transform({
      filename: filename ?? defaultLightningFilename,
      code: Buffer.from(rawSource),
      visitor,
      minify: false,
      ...transformOverrides,
    })

    const replaceSpecificity = createRootSpecificityReplacer(resolvedOptions)
    const decodedCode = textDecoder.decode(lightningResult.code)
    const code = replaceSpecificity ? replaceSpecificity(decodedCode) : decodedCode

    return {
      code,
      map: lightningResult.map ? textDecoder.decode(lightningResult.map) : undefined,
      warnings: lightningResult.warnings,
    }
  }
}
