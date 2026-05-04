import type { TailwindV4DesignSystem, TailwindV4ResolvedSource } from './types'
import { importTailwindV4NodeModule } from './node'

export async function loadTailwindV4DesignSystem(source: TailwindV4ResolvedSource): Promise<TailwindV4DesignSystem> {
  const { __unstable__loadDesignSystem } = await importTailwindV4NodeModule()
  let lastError: unknown

  for (const base of [source.base, ...source.baseFallbacks]) {
    try {
      return await __unstable__loadDesignSystem(source.css, { base })
    }
    catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('加载 Tailwind CSS v4 design system 失败。')
}

export function resolveValidTailwindV4Candidates(
  designSystem: TailwindV4DesignSystem,
  candidates: Iterable<string>,
) {
  const parsedCandidates = [...new Set(candidates)]
    .filter(candidate => typeof candidate === 'string' && candidate.length > 0)
    .filter(candidate => designSystem.parseCandidate(candidate).length > 0)

  const cssByCandidate = parsedCandidates.length > 0
    ? designSystem.candidatesToCss(parsedCandidates)
    : []
  const valid = new Set<string>()

  for (let index = 0; index < parsedCandidates.length; index += 1) {
    const candidate = parsedCandidates[index]
    const css = cssByCandidate[index]
    if (candidate && typeof css === 'string' && css.trim().length > 0) {
      valid.add(candidate)
    }
  }

  return valid
}
