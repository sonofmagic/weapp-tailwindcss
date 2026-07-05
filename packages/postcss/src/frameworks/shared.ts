import type { PostcssStyleTarget } from '../style-targets'
import type { PostcssFrameworkStrategy, PostcssFrameworkType, ResolvePostcssFrameworkOptions } from './types'

export function isWebLikeStylePlatform(platform: string | undefined) {
  const normalized = platform?.trim().toLowerCase()
  return normalized === 'h5'
    || normalized === 'web'
    || normalized?.startsWith('web-') === true
    || normalized === 'app'
    || normalized === 'app-plus'
    || normalized?.startsWith('app-') === true
}

export function resolveWebPlatformOrTarget(
  options: Pick<ResolvePostcssFrameworkOptions, 'platform'>,
  fallbackTarget: PostcssStyleTarget,
): PostcssStyleTarget {
  return isWebLikeStylePlatform(options.platform) ? 'web' : fallbackTarget
}

export function createStaticTargetFrameworkStrategy(
  framework: PostcssFrameworkType,
  fallbackTarget: PostcssStyleTarget,
): PostcssFrameworkStrategy {
  return {
    framework,
    resolveStyleTarget: options => resolveWebPlatformOrTarget(options, fallbackTarget),
  }
}
