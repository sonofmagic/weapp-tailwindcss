const path = require('path')

const findCandidatePaths = () => {
  const bases = new Set()
  let current = __dirname
  for (let i = 0; i < 8; i++) {
    const nodeModules = path.join(current, 'node_modules')
    bases.add(nodeModules)
    bases.add(path.join(nodeModules, '.pnpm', 'node_modules'))
    const parent = path.dirname(current)
    if (parent === current) {
      break
    }
    current = parent
  }
  return Array.from(bases)
}

const resolveChalkPath = () => {
  const bases = findCandidatePaths()
  for (const base of bases) {
    if (!base) {
      continue
    }
    try {
      return require.resolve('chalk', { paths: [base] })
    }
    catch (_) {
      // ignore and keep searching
    }
  }
  return null
}

const modulePath = resolveChalkPath()
if (!modulePath) {
  return
}

const chalkExports = require(modulePath)
if (!chalkExports || typeof chalkExports.cyan === 'function' || typeof chalkExports.default !== 'function') {
  return
}

const compat = chalkExports.default
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
