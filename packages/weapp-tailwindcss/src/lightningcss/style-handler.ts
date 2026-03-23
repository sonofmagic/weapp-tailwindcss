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

interface PreparedLightningcssRuntime {
  options: IStyleHandlerOptions
  replaceSpecificity?: (code: string) => string
  visitor: TransformOptions<CustomAtRules>['visitor']
}

function createPreparedRuntime(options?: Partial<IStyleHandlerOptions>): PreparedLightningcssRuntime {
  const resolvedOptions = prepareStyleOptions(options)
  const ctx: SelectorTransformContext = {
    options: resolvedOptions,
    childCombinatorReplacement: buildChildCombinatorReplacement(resolvedOptions),
  }

  return {
    options: resolvedOptions,
    replaceSpecificity: createRootSpecificityReplacer(resolvedOptions),
    visitor: createVisitor(ctx),
  }
}

export function createLightningcssStyleHandler(
  options?: Partial<IStyleHandlerOptions>,
  config: LightningcssTransformConfig = {},
): LightningcssStyleHandler {
  const baseRuntime = createPreparedRuntime(options)
  const { transformOptions, filename } = config
  const transformOverrides = transformOptions ?? {}

  return async (rawSource, overrideOptions) => {
    const runtime = !overrideOptions || Object.keys(overrideOptions).length === 0
      ? baseRuntime
      : createPreparedRuntime(
          defuOverrideArray<IStyleHandlerOptions, Partial<IStyleHandlerOptions>[]>(
            overrideOptions as IStyleHandlerOptions,
            baseRuntime.options,
          ),
        )
    const lightningResult = transform({
      filename: filename ?? defaultLightningFilename,
      code: Buffer.from(rawSource),
      visitor: runtime.visitor,
      minify: false,
      ...transformOverrides,
    })

    const decodedCode = textDecoder.decode(lightningResult.code)
    const code = runtime.replaceSpecificity ? runtime.replaceSpecificity(decodedCode) : decodedCode

    return {
      code,
      map: lightningResult.map ? textDecoder.decode(lightningResult.map) : undefined,
      warnings: lightningResult.warnings,
    }
  }
}
