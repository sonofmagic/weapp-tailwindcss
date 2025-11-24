const fs = require('fs')
const path = require('path')

const safeResolve = (specifier, options) => {
  try {
    return require.resolve(specifier, options)
  }
  catch (_) {
    return null
  }
}

const LEGACY_KEYWORDS = ['formatMinimum', 'formatMaximum']
const LEGACY_KEYWORD_SET = new Set(LEGACY_KEYWORDS)
const legacyKeywordCache = new Map()
const legacyWarnings = new Set()
let legacyKeywordsBaseDir
let legacyDirResolved = false

const ensureLegacyFormats = (ajv) => {
  if (!ajv || ajv._formats || !ajv.formats) {
    return
  }
  const { formats } = ajv
  if (formats instanceof Map) {
    const normalized = {}
    for (const [name, format] of formats.entries()) {
      normalized[name] = format
    }
    ajv._formats = normalized
  }
  else if (typeof formats === 'object') {
    ajv._formats = formats
  }
}

const ensureLegacyAddKeyword = (ajv) => {
  if (!ajv || typeof ajv.addKeyword !== 'function' || ajv.__weappTwAddKeywordPatched) {
    return
  }

  const originalAddKeyword = ajv.addKeyword
  function compatAddKeyword(keyword, definition, ...rest) {
    if (definition === undefined && keyword && typeof keyword === 'object') {
      if (Array.isArray(keyword)) {
        let result
        for (const item of keyword) {
          result = compatAddKeyword.call(this, item)
        }
        return result
      }
      if (keyword.keyword) {
        return originalAddKeyword.call(this, keyword.keyword, keyword, ...rest)
      }
    }
    return originalAddKeyword.call(this, keyword, definition, ...rest)
  }

  Object.assign(compatAddKeyword, originalAddKeyword)

  compatAddKeyword.__weappTwPatched = true
  ajv.addKeyword = compatAddKeyword
  ajv.__weappTwAddKeywordPatched = true
}

const warnOnce = (key, message) => {
  if (legacyWarnings.has(key)) {
    return
  }
  legacyWarnings.add(key)
  console.warn('[patch-ajv-keywords]', message)
}

const findLegacyAjvKeywordsDir = () => {
  if (legacyDirResolved) {
    return legacyKeywordsBaseDir
  }
  legacyDirResolved = true
  let current = __dirname
  for (let i = 0; i < 8; i++) {
    const pnpmDir = path.join(current, 'node_modules', '.pnpm')
    try {
      const entries = fs.readdirSync(pnpmDir)
      for (const entry of entries) {
        if (!entry.startsWith('ajv-keywords@3.')) {
          continue
        }
        const candidate = path.join(pnpmDir, entry, 'node_modules', 'ajv-keywords')
        if (fs.existsSync(candidate)) {
          legacyKeywordsBaseDir = candidate
          return legacyKeywordsBaseDir
        }
      }
    }
    catch (_) {}
    const parent = path.dirname(current)
    if (parent === current) {
      break
    }
    current = parent
  }
  return null
}

const loadLegacyKeywordFactory = (keyword) => {
  if (!LEGACY_KEYWORD_SET.has(keyword)) {
    return null
  }
  if (legacyKeywordCache.has(keyword)) {
    return legacyKeywordCache.get(keyword)
  }
  const baseDir = findLegacyAjvKeywordsDir()
  if (!baseDir) {
    legacyKeywordCache.set(keyword, null)
    warnOnce('legacy-missing', 'unable to locate ajv-keywords@3.x, legacy keywords unavailable')
    return null
  }
  let factory = null
  try {
    factory = require(path.join(baseDir, 'keywords', keyword))
  }
  catch (err) {
    warnOnce(`legacy-load-${keyword}`, `failed to load legacy keyword ${keyword}: ${err && err.message}`)
  }
  legacyKeywordCache.set(keyword, factory)
  return factory
}

const applyLegacyKeywords = (ajv, legacyRequest) => {
  if (!ajv) {
    return
  }
  let targets
  if (typeof legacyRequest === 'undefined') {
    targets = LEGACY_KEYWORDS
  }
  else if (!legacyRequest || !legacyRequest.length) {
    return
  }
  else {
    targets = legacyRequest
  }

  const seen = ajv.__weappTwLegacyKeywords || (ajv.__weappTwLegacyKeywords = new Set())
  for (const name of targets) {
    if (seen.has(name)) {
      continue
    }
    const factory = loadLegacyKeywordFactory(name)
    if (typeof factory !== 'function') {
      continue
    }
    try {
      factory(ajv)
      seen.add(name)
    }
    catch (err) {
      warnOnce(`legacy-apply-${name}`, `failed to register legacy keyword ${name}: ${err && err.message}`)
    }
  }
}

const splitKeywordRequest = (keyword) => {
  if (typeof keyword === 'undefined') {
    return { modern: undefined, legacy: undefined }
  }
  if (Array.isArray(keyword)) {
    const modern = []
    const legacy = []
    for (const name of keyword) {
      if (LEGACY_KEYWORD_SET.has(name)) {
        legacy.push(name)
      }
      else {
        modern.push(name)
      }
    }
    return {
      modern: modern.length ? modern : null,
      legacy,
    }
  }
  if (LEGACY_KEYWORD_SET.has(keyword)) {
    return { modern: null, legacy: [keyword] }
  }
  return { modern: keyword, legacy: [] }
}

const collectModulePaths = () => {
  const targets = new Set()
  const local = safeResolve('ajv-keywords')
  if (local) {
    targets.add(local)
  }
  const pluginPkg = safeResolve('@dcloudio/vue-cli-plugin-uni/package.json')
  if (pluginPkg) {
    const pluginDir = path.dirname(pluginPkg)
    const pluginTarget = safeResolve('ajv-keywords', { paths: [pluginDir] })
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
  const original = require(modulePath)
  if (original.__weappTwPatched) {
    return
  }

  const patched = function patchedAjvKeywords(ajv, keyword) {
    ensureLegacyFormats(ajv)
    ensureLegacyAddKeyword(ajv)
    const { modern, legacy } = splitKeywordRequest(keyword)
    let result
    if (modern === null) {
      result = ajv
    }
    else if (typeof modern === 'undefined') {
      result = original(ajv)
    }
    else {
      result = original(ajv, modern)
    }
    applyLegacyKeywords(ajv, legacy)
    return result
  }

  patched.get = (keyword) => {
    try {
      return original.get(keyword)
    }
    catch (error) {
      const legacyFactory = loadLegacyKeywordFactory(keyword)
      if (legacyFactory) {
        return legacyFactory
      }
      throw error
    }
  }
  patched.default = patched
  patched.__esModule = true
  patched.__weappTwPatched = true

  require.cache[modulePath].exports = patched
}

const modules = collectModulePaths()
if (!modules.length) {
  warnOnce('resolver-miss', 'no ajv-keywords modules located for patching')
}
else {
  modules.forEach(patchModule)
}
