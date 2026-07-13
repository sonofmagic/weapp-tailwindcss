import type { Plugin, ResolvedConfig } from 'vite'

type TransformHandler = (
  this: unknown,
  code: string,
  id: string,
  ...args: unknown[]
) => unknown

const wrappedCssPostPlugins = new WeakSet<Plugin>()

export interface FrameworkWatchCssAdaptationOptions {
  enabled: boolean
  isWatchBuild: boolean
  isWebGeneratorBranch: boolean
  ownsTailwindGeneration: boolean
  platform?: string | undefined
}

function isWebOrNativeAppPlatform(platform: string | undefined) {
  return platform === 'h5'
    || platform === 'web'
    || platform?.startsWith('web-') === true
    || platform === 'app'
    || platform === 'app-plus'
    || platform?.startsWith('app-') === true
}

export function shouldAdaptFrameworkWatchCssBeforeCache(
  options: FrameworkWatchCssAdaptationOptions,
) {
  return options.enabled
    && options.ownsTailwindGeneration
    && options.isWatchBuild
    && (options.platform
      ? !isWebOrNativeAppPlatform(options.platform)
      : !options.isWebGeneratorBranch)
}

function resolveTransformHandler(plugin: Plugin) {
  const hook = plugin.transform
  if (typeof hook === 'function') {
    return hook as TransformHandler
  }
  if (hook && typeof hook === 'object' && typeof hook.handler === 'function') {
    return hook.handler as TransformHandler
  }
}

/**
 * 在框架的 CSS post hook 持久化样式前完成转换，保证 watch 重放缓存时不会重新输出原始 CSS。
 */
export function wrapViteCssPostTransform(
  config: ResolvedConfig,
  transformCss: (css: string, id: string) => Promise<string>,
) {
  const plugin = config.plugins?.find(candidate => candidate.name === 'vite:css-post')
  if (!plugin || wrappedCssPostPlugins.has(plugin)) {
    return false
  }

  const originalHandler = resolveTransformHandler(plugin)
  if (!originalHandler) {
    return false
  }

  const wrappedHandler: TransformHandler = async function (code, id, ...args) {
    const transformedCss = await transformCss(code, id)
    return originalHandler.call(this, transformedCss, id, ...args)
  }

  const originalHook = plugin.transform
  plugin.transform = (originalHook && typeof originalHook === 'object'
    ? {
        ...originalHook,
        handler: wrappedHandler,
      }
    : wrappedHandler) as NonNullable<Plugin['transform']>
  wrappedCssPostPlugins.add(plugin)
  return true
}
