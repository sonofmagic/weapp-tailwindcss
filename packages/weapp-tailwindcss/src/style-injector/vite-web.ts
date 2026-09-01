import type { Plugin } from 'vite'
import type { WeappTailwindcssStyleInjectorUserOptions } from './options'
import { weappStyleInjector } from 'weapp-style-injector/vite'
import { normalizeStyleInjectorOptions } from './options'

function getHandler(hook: Plugin['transform'] | Plugin['generateBundle'] | undefined) {
  if (typeof hook === 'function') {
    return hook
  }
  if (hook && typeof hook === 'object' && typeof hook.handler === 'function') {
    return hook.handler
  }
}

/** Generic Web 专用 style injector，避免引入其他构建器和框架适配。 */
export function createBuiltinViteWebStyleInjectorPlugins(
  options: WeappTailwindcssStyleInjectorUserOptions | undefined,
): Plugin[] {
  const normalized = normalizeStyleInjectorOptions(options)
  if (!normalized) {
    return []
  }
  const injector = weappStyleInjector(normalized)
  const transform = getHandler(injector.transform)
  const generateBundle = getHandler(injector.generateBundle)
  return [
    {
      name: 'weapp-tailwindcss:web-style-injector-pre',
      apply: 'build',
      enforce: 'pre',
      configResolved(config) {
        injector.configResolved?.(config)
      },
      async buildStart() {
        await injector.buildStart?.call(this, {})
      },
      async transform(code, id, options2) {
        return transform?.call(this, code, id, options2)
      },
    },
    {
      name: 'weapp-tailwindcss:web-style-injector',
      apply: 'build',
      enforce: 'post',
      configResolved(config) {
        injector.configResolved?.(config)
      },
      async generateBundle(outputOptions, bundle, isWrite) {
        await generateBundle?.call(this, outputOptions, bundle, isWrite)
      },
    },
  ]
}
