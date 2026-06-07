import type { RuntimeContext } from './types.ts'
import { spawnSync } from 'node:child_process'
import path from 'pathe'

export function compareImages(actual: string, expected: string, name: string, context: RuntimeContext) {
  const diff = path.join(context.artifactRoot, 'diffs', `${name}.png`)
  const normalizedActual = path.join(context.artifactRoot, 'diffs', `${name}-actual.png`)
  const normalizedExpected = path.join(context.artifactRoot, 'diffs', `${name}-expected.png`)
  spawnSync('magick', [actual, '-resize', `${context.viewport.width}x${context.viewport.height}!`, normalizedActual], { stdio: 'ignore' })
  spawnSync('magick', [expected, '-resize', `${context.viewport.width}x${context.viewport.height}!`, normalizedExpected], { stdio: 'ignore' })
  const compared = spawnSync('magick', ['compare', '-metric', 'AE', normalizedActual, normalizedExpected, diff], {
    encoding: 'utf8',
  })
  const differentPixels = Number((compared.stderr || compared.stdout || '0').trim()) || 0
  return {
    diff,
    differentPixels,
    ratio: Math.round((differentPixels / (context.viewport.width * context.viewport.height)) * 10000) / 10000,
  }
}
