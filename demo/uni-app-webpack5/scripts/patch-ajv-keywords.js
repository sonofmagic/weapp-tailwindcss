const modulePath = require.resolve('ajv-keywords')
const original = require(modulePath)

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

if (!original.__weappTwPatched) {
  const patched = function patchedAjvKeywords(ajv, keyword) {
    ensureLegacyFormats(ajv)
    return original(ajv, keyword)
  }

  patched.get = original.get
  patched.default = patched
  patched.__esModule = true
  patched.__weappTwPatched = true

  require.cache[modulePath].exports = patched
}
