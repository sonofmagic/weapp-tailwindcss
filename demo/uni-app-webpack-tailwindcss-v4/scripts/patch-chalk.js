const path = require('path')

const safeResolve = (specifier, options) => {
  try {
    return require.resolve(specifier, options)
  }
  catch (_) {
    return null
  }
}

const collectModulePaths = () => {
  const targets = new Set()
  const local = safeResolve('chalk')
  if (local) {
    targets.add(local)
  }
  const pluginPkg = safeResolve('@dcloudio/vue-cli-plugin-uni/package.json')
  if (pluginPkg) {
    const pluginDir = path.dirname(pluginPkg)
    const pluginTarget = safeResolve('chalk', { paths: [pluginDir] })
    if (pluginTarget) {
      targets.add(pluginTarget)
    }
  }
  return Array.from(targets)
}

const patchModule = (modulePath) => {
  if (!modulePath) {
    return
  }
  const chalkExports = require(modulePath)
  if (!chalkExports || typeof chalkExports.cyan === 'function') {
    return
  }
  const compat = typeof chalkExports.default === 'function' ? chalkExports.default : null
  if (!compat) {
    return
  }
  for (const key of Object.keys(chalkExports)) {
    if (key === 'default') {
      continue
    }
    if (typeof compat[key] === 'undefined') {
      compat[key] = chalkExports[key]
    }
  }
  const cacheEntry = require.cache[modulePath]
  if (cacheEntry) {
    cacheEntry.exports = compat
  }
}

const modules = collectModulePaths()
modules.forEach(patchModule)
