/* eslint-disable style/max-statements-per-line */

import type { TailwindV4SourceOptions } from 'weapp-tailwindcss/generator'
import type { NativeStyleManifest } from './types'
import { createWeappTailwindcssGenerator, resolveTailwindV4Source } from 'weapp-tailwindcss/generator'
import { addNativeVariantRules, compileNativeStylesheet, finalizeNativeManifest } from './compiler'

export interface GenerateNativeStylesheetOptions extends TailwindV4SourceOptions {
  candidates?: Iterable<string> | undefined
  sourceGlobs?: string[] | undefined
}

/**
 * 使用 weapp-tailwindcss 的 Tailwind v4 generator 生成原始 CSS，再编译为 RN manifest。
 */
export async function generateNativeStylesheet(options: GenerateNativeStylesheetOptions = {}): Promise<NativeStyleManifest> {
  const source = await resolveTailwindV4Source(options)
  const generator = createWeappTailwindcssGenerator(source)
  const sourcePatterns = options.sourceGlobs?.map(pattern => ({ base: source.projectRoot, pattern, negated: false }))
  const generatorCandidates = new Set(options.candidates ?? [])
  for (const candidate of generatorCandidates) {
    const base = candidate.split(':').at(-1)
    if (base && /^(?:ios|android|native):/.test(candidate)) { generatorCandidates.add(base) }
  }
  let generated = await generator.generate({
    target: 'web',
    ...(generatorCandidates.size ? { candidates: generatorCandidates } : {}),
    scanSources: sourcePatterns ?? true,
  })
  const platformBases = new Set<string>()
  for (const candidate of generated.rawCandidates ?? []) {
    const base = candidate.split(':').at(-1)
    if (base && /^(?:ios|android|native):/.test(candidate) && !generated.classSet.has(base)) { platformBases.add(base) }
  }
  if (platformBases.size) {
    generated = await generator.generate({
      target: 'web',
      candidates: new Set([...generatorCandidates, ...platformBases]),
      scanSources: sourcePatterns ?? true,
    })
  }
  const classSet = new Set(generated.classSet)
  const requestedCandidates = new Set(options.candidates ?? [])
  for (const candidate of generated.rawCandidates ?? []) {
    const base = candidate.split(':').at(-1)
    if (base && generated.classSet.has(base) && /^(?:dark|ios|android|native):/.test(candidate)) { requestedCandidates.add(candidate) }
  }
  for (const candidate of requestedCandidates) { classSet.add(candidate) }
  const manifest = compileNativeStylesheet(generated.rawCss, { classSet })
  addNativeVariantRules(manifest, requestedCandidates)
  finalizeNativeManifest(manifest)
  generator.dispose?.()
  return manifest
}
