import postcssrc from 'postcss-load-config'
import { removeTailwindPostcssPlugins } from './official-tailwind-plugins'

export async function resolveFilteredPostcssConfig(root: string) {
  try {
    const loaded = await postcssrc({}, root)
    const plugins = Array.isArray(loaded.plugins) ? [...loaded.plugins] : []
    const removed = removeTailwindPostcssPlugins(plugins)
    if (removed === 0) {
      return
    }
    return {
      options: loaded.options,
      plugins,
      removed,
    }
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('No PostCSS Config found')) {
      return
    }
    throw error
  }
}
