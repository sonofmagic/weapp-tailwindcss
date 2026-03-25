import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'comment-json'

interface ManifestJson {
  'uni-app-x'?: {
    styleIsolationVersion?: string | number
  }
}

const manifestCache = new Map<string, boolean>()

export function resolveUniAppXStyleIsolationEnabled(root?: string) {
  if (!root) {
    return false
  }
  const normalizedRoot = path.resolve(root)
  const cached = manifestCache.get(normalizedRoot)
  if (cached !== undefined) {
    return cached
  }
  const manifestPath = path.join(normalizedRoot, 'manifest.json')
  let enabled = false
  try {
    const raw = fs.readFileSync(manifestPath, 'utf8')
    const manifest = parse(raw) as ManifestJson
    enabled = `${manifest['uni-app-x']?.styleIsolationVersion ?? ''}` === '2'
  }
  catch {
    enabled = false
  }
  manifestCache.set(normalizedRoot, enabled)
  return enabled
}

export function clearUniAppXStyleIsolationCache() {
  manifestCache.clear()
}
