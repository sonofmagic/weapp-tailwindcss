import type { RuntimeContext, VisualPlatform } from './types.ts'
import path from 'pathe'

export function resolveScreenshotsRoot(context: RuntimeContext) {
  return path.join(context.artifactRoot, 'screenshots')
}

export function resolveScreenshotPath(context: RuntimeContext, name: string, platform: VisualPlatform) {
  return path.join(resolveScreenshotsRoot(context), name, platform, 'screenshot.png')
}

export function resolveHmrScreenshotPath(
  context: RuntimeContext,
  name: string,
  platform: VisualPlatform,
  phase: 'before' | 'after',
) {
  return path.join(resolveScreenshotsRoot(context), name, platform, `hmr-${phase}.png`)
}
