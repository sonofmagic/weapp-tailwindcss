import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss'
import type { TransformOptions, Warning } from 'lightningcss'
import type { SelectorTransformContext } from './selector-transform'
import { Buffer } from 'node:buffer'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import { transform } from 'lightningcss'
import { createRootSpecificityReplacer, prepareStyleOptions } from './options'
import { buildChildCombinatorReplacement, createVisitor } from './selector-transform'

const textDecoder = new TextDecoder()
const defaultLightningFilename = 'inline.css'
type CustomAtRules = Record<string, never>

export interface LightningcssStyleHandlerResult {
  code: string
  map?: string | undefined
  warnings: Warning[]
}

export interface LightningcssTransformConfig {
  filename?: string | undefined
  transformOptions?: Omit<TransformOptions<CustomAtRules>, 'filename' | 'code' | 'visitor'> | undefined
}

interface LightningcssStyleHandler {
  (rawSource: string, overrideOptions?: Partial<IStyleHandlerOptions>): Promise<LightningcssStyleHandlerResult>
}

interface PreparedLightningcssRuntime {
  options: IStyleHandlerOptions
  replaceSpecificity?: ((code: string) => string) | undefined
  visitor: TransformOptions<CustomAtRules>['visitor']
}

function omitUndefined<T extends object>(value: T) {
  const result: Partial<T> = {}
  for (const [key, item] of Object.entries(value) as [keyof T, T[keyof T]][]) {
    if (item !== undefined) {
      result[key] = item
    }
  }
  return result
}

function createPreparedRuntime(options?: Partial<IStyleHandlerOptions>): PreparedLightningcssRuntime {
  const resolvedOptions = prepareStyleOptions(options)
  const ctx = omitUndefined({
    options: resolvedOptions,
    childCombinatorReplacement: buildChildCombinatorReplacement(resolvedOptions),
  }) as SelectorTransformContext

  return omitUndefined({
    options: resolvedOptions,
    replaceSpecificity: createRootSpecificityReplacer(resolvedOptions),
    visitor: createVisitor(ctx),
  }) as PreparedLightningcssRuntime
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
    const lightningResult = transform(omitUndefined({
      filename: filename ?? defaultLightningFilename,
      code: Buffer.from(rawSource),
      visitor: runtime.visitor,
      minify: false,
      ...transformOverrides,
    }) as TransformOptions<CustomAtRules>)

    const decodedCode = textDecoder.decode(lightningResult.code)
    const code = runtime.replaceSpecificity ? runtime.replaceSpecificity(decodedCode) : decodedCode

    return omitUndefined({
      code,
      map: lightningResult.map ? textDecoder.decode(lightningResult.map) : undefined,
      warnings: lightningResult.warnings,
    }) as LightningcssStyleHandlerResult
  }
}

const defaultHandler = createLightningcssStyleHandler(undefined, {
  transformOptions: { minify: true },
})

export async function transformCss(css: string | Buffer = '.foo { color: red }') {
  const result = await defaultHandler(
    typeof css === 'string' ? css : css.toString(),
  )

  return {
    ...result,
    code: Buffer.from(result.code),
    map: result.map ? Buffer.from(result.map) : undefined,
  }
}

export {
  createRootSpecificityReplacer,
  prepareStyleOptions,
} from './options'
export {
  buildChildCombinatorReplacement,
  createVisitor,
  type SelectorTransformContext,
} from './selector-transform'
export {
  assignNestedSelectors,
  cloneComponent,
  cloneComponents,
  createTypeSelector,
  matchesHiddenNot,
  normalizeNestedSelectors,
  trimCombinators,
} from './selector-utils'
