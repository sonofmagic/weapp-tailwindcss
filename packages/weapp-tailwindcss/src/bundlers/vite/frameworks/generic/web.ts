import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { createBuiltinViteWebStyleInjectorPlugins } from '@/style-injector/vite-web'
import { createGenericWebViteCapabilityProfile } from '../../capability-profile'
import { createCssOnlyVitePlugins } from '../../shared/create-css-only-plugins-runtime'
import { createViteSourceOutputRelationOwner, withViteSourceOutputRelationOwner } from '../../source-output-relations'

/** Generic Web CSS-only profile，供 `vite/web` 入口直接使用。 */
export function createGenericWebVitePlugins(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
  const capability = createGenericWebViteCapabilityProfile(options as UserDefinedOptions)
  const owner = createViteSourceOutputRelationOwner()
  const plugins = withViteSourceOutputRelationOwner(owner, () => createCssOnlyVitePlugins({
    ...options,
    __internalViteCapabilityProfile: capability,
    __internalViteWebStyleInjectorFactory: createBuiltinViteWebStyleInjectorPlugins,
  } as InternalUserDefinedOptions))
  if (!plugins) {
    owner.dispose()
    return undefined
  }
  return plugins.map((plugin) => {
    const wrapped: any = { ...plugin }
    if (plugin.watchChange) {
      const hook = plugin.watchChange
      wrapped.watchChange = async function (this: unknown, ...args: any[]) {
        const id = args[0]
        const change = args[1]
        if (change?.event === 'delete') {
          owner.removeSource(id)
        }
        else if (typeof id === 'string') {
          owner.observeSource(id)
        }
        return typeof hook === 'function' ? hook.apply(this, args) : hook.handler?.apply(this, args)
      }
    }
    if (plugin.handleHotUpdate) {
      const hook = plugin.handleHotUpdate
      wrapped.handleHotUpdate = async function (this: unknown, ...args: any[]) {
        const file = args[0]?.file
        if (typeof file === 'string') {
          owner.observeSource(file)
        }
        return typeof hook === 'function' ? hook.apply(this, args) : hook.handler?.apply(this, args)
      }
    }
    if (plugin.closeBundle) {
      const hook = plugin.closeBundle
      wrapped.closeBundle = async function (this: unknown, ...args: any[]) {
        try {
          return typeof hook === 'function' ? await hook.apply(this, args) : await hook.handler?.apply(this, args)
        }
        finally {
          owner.dispose()
        }
      }
    }
    return wrapped
  })
}
