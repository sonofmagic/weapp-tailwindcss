const fs = require('node:fs')
const path = require('node:path')

function safeResolve(specifier, opts) {
  try {
    return require.resolve(specifier, opts)
  }
  catch {
    return null
  }
}

function patchFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return false
  }

  const content = fs.readFileSync(filePath, 'utf8')
  if (content.includes('ajv._formats || ajv.formats')) {
    return false
  }

  const updated = content.replace(
    '  var formats = ajv._formats;',
    '  var formats = ajv._formats || ajv.formats;\n  if (!formats) return;'
  )
  if (updated === content) {
    return false
  }

  fs.writeFileSync(filePath, updated, 'utf8')
  return true
}

function collectTargets() {
  const targets = new Set()
  const local = safeResolve('ajv-keywords/keywords/_formatLimit')
  if (local) {
    targets.add(local)
  }

  const pluginPkg = safeResolve('@dcloudio/vue-cli-plugin-uni/package.json')
  if (pluginPkg) {
    const pluginDir = path.dirname(pluginPkg)
    const pluginTarget = safeResolve('ajv-keywords/keywords/_formatLimit', { paths: [pluginDir] })
    if (pluginTarget) {
      targets.add(pluginTarget)
    }
  }

  return Array.from(targets)
}

function main() {
  const targets = collectTargets()
  if (!targets.length) {
    console.warn('[patch-ajv-keywords] no target files located')
    return
  }

  targets.forEach((filePath) => {
    const applied = patchFile(filePath)
    const relative = path.relative(process.cwd(), filePath)
    if (applied) {
      console.log('[patch-ajv-keywords] patched', relative)
    }
    else {
      console.log('[patch-ajv-keywords] no changes needed for', relative)
    }
  })
}

main()
