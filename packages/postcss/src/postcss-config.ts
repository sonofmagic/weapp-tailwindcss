import postcssrc from 'postcss-load-config'

const tailwindPostcssPluginNames = new Set(['tailwindcss', '@tailwindcss/postcss'])

export function getPostcssPluginName(plugin: unknown): string | undefined {
  if (!plugin) {
    return
  }
  if (typeof plugin === 'function' && 'postcss' in plugin) {
    try {
      return getPostcssPluginName(plugin())
    }
    catch {
      return
    }
  }
  if (typeof plugin !== 'object' || !('postcssPlugin' in plugin)) {
    return
  }
  const { postcssPlugin } = plugin as { postcssPlugin?: unknown }
  return typeof postcssPlugin === 'string' ? postcssPlugin : undefined
}

function isTailwindPostcssPlugin(plugin: unknown) {
  const name = getPostcssPluginName(plugin)
  return typeof name === 'string' && tailwindPostcssPluginNames.has(name)
}

export function removeTailwindPostcssPlugins(plugins: unknown[]) {
  let removed = 0
  for (let i = plugins.length - 1; i >= 0; i--) {
    if (isTailwindPostcssPlugin(plugins[i])) {
      plugins.splice(i, 1)
      removed++
    }
  }
  return removed
}

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
