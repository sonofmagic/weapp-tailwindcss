import type { RuntimeContext, VisualPlatform } from './types.ts'
import path from 'pathe'

export function resolveScreenshotsRoot(context: RuntimeContext) {
  return path.join(context.artifactRoot, 'screenshots')
}

function resolveScreenshotDir(context: RuntimeContext, name: string, platform: VisualPlatform, variant?: string) {
  return path.join(resolveScreenshotsRoot(context), name, platform, ...(variant ? [variant] : []))
}

export function resolveScreenshotPath(context: RuntimeContext, name: string, platform: VisualPlatform, variant?: string) {
  return path.join(resolveScreenshotDir(context, name, platform, variant), 'screenshot.png')
}

export function resolveThemeScreenshotPath(
  context: RuntimeContext,
  name: string,
  platform: VisualPlatform,
  mode: 'light' | 'manual-dark',
  variant?: string,
) {
  return path.join(resolveScreenshotDir(context, name, platform, variant), `theme-${mode}.png`)
}

export function resolveHmrScreenshotPath(
  context: RuntimeContext,
  name: string,
  platform: VisualPlatform,
  phase: 'before' | 'after',
  variant?: string,
) {
  return path.join(resolveScreenshotDir(context, name, platform, variant), `hmr-${phase}.png`)
}
