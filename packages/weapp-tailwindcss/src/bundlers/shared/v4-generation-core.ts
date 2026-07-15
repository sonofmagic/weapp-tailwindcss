import type { GenerateCssByGeneratorOptions, GenerateCssByGeneratorResult } from './generator-css'
import type { InternalUserDefinedOptions } from '@/types'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { adaptGeneratedCssWithFrameworkPipeline, hasFrameworkPostcssOptions } from './framework-postcss'
import { generateCssByGenerator } from './generator-css'

export interface TailwindV4GenerationCoreInput extends GenerateCssByGeneratorOptions {
  frameworkPostcssOwner?: InternalUserDefinedOptions | undefined
  frameworkPostcssStage?: 'complete' | 'pending' | undefined
  outputFile?: string | undefined
  sourceCandidates?: Set<string> | undefined
}

export interface TailwindV4GenerationCoreResult extends GenerateCssByGeneratorResult {
  classSet: Set<string>
  dependencies: string[]
  metadata: NonNullable<GenerateCssByGeneratorResult['metadata']>
}

export async function generateTailwindV4Css(
  options: TailwindV4GenerationCoreInput,
): Promise<TailwindV4GenerationCoreResult | undefined> {
  const majorVersion = options.runtimeState.tailwindRuntime.majorVersion
  if (majorVersion !== 4) {
    throw new Error('weapp-tailwindcss 生成管线仅支持 Tailwind CSS v4。')
  }
  const frameworkPostcssOwner = options.frameworkPostcssOwner ?? options.opts
  const shouldReplayFrameworkPostcss = options.frameworkPostcssStage === 'complete'
    && hasFrameworkPostcssOptions(frameworkPostcssOwner)
    && normalizeWeappTailwindcssGeneratorOptions(options.opts.generator, {
      appType: options.opts.appType,
      platform: options.generatorPlatform ?? options.opts.cssOptions?.platform ?? options.opts.platform,
      tailwindcssMajorVersion: majorVersion,
      uniAppX: options.opts.uniAppX,
    }).target === 'weapp'
  const generated = await generateCssByGenerator(
    shouldReplayFrameworkPostcss
      ? {
          ...options,
          deferCssAdaptation: true,
        }
      : options,
  )
  if (!generated) {
    return undefined
  }
  const css = shouldReplayFrameworkPostcss
    ? await adaptGeneratedCssWithFrameworkPipeline(frameworkPostcssOwner, generated, {
        cssHandlerOptions: options.cssHandlerOptions,
        file: options.file,
        majorVersion,
        styleHandler: options.styleHandler,
      })
    : generated.css
  return {
    ...generated,
    css,
    classSet: generated.classSet,
    dependencies: generated.dependencies,
    metadata: {
      file: options.file,
      majorVersion,
      outputFile: options.outputFile,
      ...(generated.metadata ?? {}),
    },
  }
}
