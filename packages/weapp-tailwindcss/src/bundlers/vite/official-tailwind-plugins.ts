import type { Plugin } from 'vite'

function isTailwindVitePlugin(plugin: unknown) {
  if (!plugin || typeof plugin !== 'object' || !('name' in plugin)) {
    return false
  }
  const { name } = plugin as { name?: unknown }
  return typeof name === 'string' && name.startsWith('@tailwindcss/vite')
}

export function removeTailwindVitePlugins(plugins: Plugin[]) {
  let removed = 0
  for (let i = plugins.length - 1; i >= 0; i--) {
    if (isTailwindVitePlugin(plugins[i])) {
      plugins.splice(i, 1)
      removed++
    }
  }
  return removed
}

function disableTailwindVitePlugin(plugin: unknown) {
  if (!isTailwindVitePlugin(plugin)) {
    return false
  }

  const mutablePlugin = plugin as Record<string, unknown>
  for (const hook of ['configResolved', 'configureServer', 'transform', 'hotUpdate', 'handleHotUpdate']) {
    delete mutablePlugin[hook]
  }
  return true
}

export function disableAndRemoveTailwindVitePlugins(plugins: unknown[]) {
  let removed = 0
  for (let i = plugins.length - 1; i >= 0; i--) {
    const plugin = plugins[i]
    if (Array.isArray(plugin)) {
      removed += disableAndRemoveTailwindVitePlugins(plugin)
      if (plugin.length === 0) {
        plugins.splice(i, 1)
      }
      continue
    }
    if (disableTailwindVitePlugin(plugin)) {
      plugins.splice(i, 1)
      removed++
    }
  }
  return removed
}
