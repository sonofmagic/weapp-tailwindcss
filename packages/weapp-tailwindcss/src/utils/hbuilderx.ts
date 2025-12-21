import path from 'node:path'
import process from 'node:process'

const KNOWN_MAC_PLUGIN_DIRS = [
  '/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli-vite',
  '/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli',
] as const

const HBUILDERX_PLUGIN_CWD_RE
  = /[\\/]HBuilderX(?:\.[^\\/]*)?(?:[\\/]Contents[\\/]HBuilderX)?[\\/]plugins[\\/]uniapp-cli(?:-vite)?(?:[\\/]|$)/i

export interface HBuilderXRuntimeHints {
  cwd?: string
  nodePath?: string | null
}

function hasKnownPluginPrefix(normalizedCwd: string) {
  for (const dir of KNOWN_MAC_PLUGIN_DIRS) {
    const normalizedDir = path.normalize(dir)
    if (normalizedCwd === normalizedDir || normalizedCwd.startsWith(`${normalizedDir}${path.sep}`)) {
      return true
    }
  }
  return false
}

function matchesPluginCwd(cwd: string) {
  const normalized = path.normalize(cwd)
  if (hasKnownPluginPrefix(normalized)) {
    return true
  }
  return HBUILDERX_PLUGIN_CWD_RE.test(normalized)
}

export function isRunningInHBuilderX(options: HBuilderXRuntimeHints = {}) {
  const nodePath = 'nodePath' in options ? options.nodePath : process.env.NODE_PATH
  const nodePathMissing = nodePath == null || nodePath.trim().length === 0
  if (!nodePathMissing) {
    return false
  }
  const cwd = options.cwd ?? process.cwd()
  return matchesPluginCwd(cwd)
}
