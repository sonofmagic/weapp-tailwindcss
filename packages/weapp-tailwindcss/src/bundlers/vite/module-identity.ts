import { existsSync, realpathSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { cleanUrl, slash } from './utils'

const WINDOWS_DRIVE_RE = /^\/?[a-z]:[\\/]/i
const WINDOWS_UNC_RE = /^(?:\\\\|\/\/)/

function unique(values: Iterable<string | undefined>) {
  return [...new Set([...values].filter((value): value is string => typeof value === 'string' && value.length > 0))]
}

function decodeFileId(id: string) {
  try {
    return decodeURIComponent(id)
  }
  catch {
    return id
  }
}

function stripViteFsPrefix(id: string) {
  if (!id.startsWith('/@fs/')) {
    return id
  }
  const file = id.slice('/@fs/'.length)
  return file.startsWith('/') || WINDOWS_DRIVE_RE.test(file) ? file : `/${file}`
}

function stripFileProtocol(id: string) {
  if (!id.startsWith('file://')) {
    return id
  }
  try {
    return fileURLToPath(id)
  }
  catch {
    return id
  }
}

function isWindowsFile(file: string) {
  return WINDOWS_DRIVE_RE.test(file) || WINDOWS_UNC_RE.test(file)
}

function normalizeWindowsFile(file: string) {
  const withoutDriveSlash = /^\/[a-z]:[\\/]/i.test(file) ? file.slice(1) : file
  return slash(path.win32.resolve(withoutDriveSlash))
}

function normalizeFile(file: string, root: string) {
  if (isWindowsFile(file) || isWindowsFile(root)) {
    const windowsFile = isWindowsFile(file)
      ? file
      : path.win32.resolve(root, file.replace(/^\//, ''))
    return normalizeWindowsFile(windowsFile)
  }
  if (path.isAbsolute(file)) {
    if (
      file === root
      || file.startsWith(`${root}${path.sep}`)
      || existsSync(file)
      || existsSync(path.dirname(file))
    ) {
      return slash(path.resolve(file))
    }
    const rootRelativeFile = path.resolve(root, file.slice(1))
    return existsSync(rootRelativeFile) || existsSync(path.dirname(rootRelativeFile))
      ? slash(rootRelativeFile)
      : slash(path.resolve(file))
  }
  return slash(path.resolve(root, file))
}

function resolveRealFile(file: string) {
  if (process.platform !== 'win32' && isWindowsFile(file)) {
    return file
  }
  let current = file
  const missingSegments: string[] = []
  try {
    while (true) {
      try {
        const resolvedParent = realpathSync.native(current)
        return slash(path.join(resolvedParent, ...missingSegments))
      }
      catch {
        const parent = path.dirname(current)
        if (parent === current) {
          return file
        }
        missingSegments.unshift(path.basename(current))
        current = parent
      }
    }
  }
  catch {
    return file
  }
}

function normalizeIdentityKey(file: string) {
  return isWindowsFile(file) || process.platform === 'win32' ? file.toLowerCase() : file
}

export interface ViteModuleIdentity {
  cleanId: string
  file: string | undefined
  key: string
  lookupFiles: string[]
  lookupIds: string[]
}

/**
 * 将 Vite URL、文件路径和 Windows 的等价路径收敛为同一个模块身份。
 */
export function resolveViteModuleIdentity(id: string, root = process.cwd()): ViteModuleIdentity {
  const cleanId = decodeFileId(cleanUrl(id))
  const decodedRoot = decodeFileId(cleanUrl(root))
  const normalizedRoot = isWindowsFile(decodedRoot)
    ? normalizeWindowsFile(decodedRoot)
    : slash(path.resolve(decodedRoot))
  const unwrappedId = stripFileProtocol(stripViteFsPrefix(cleanId))
  const isVirtual = unwrappedId.startsWith('\0')
  const file = isVirtual ? undefined : normalizeFile(unwrappedId, normalizedRoot)
  const realFile = file ? resolveRealFile(file) : undefined
  const key = realFile ? normalizeIdentityKey(realFile) : cleanId
  const pathApi = isWindowsFile(normalizedRoot) ? path.win32 : path.posix
  const relativeUrl = realFile && normalizeIdentityKey(realFile).startsWith(`${normalizeIdentityKey(normalizedRoot)}/`)
    ? `/${slash(pathApi.relative(normalizedRoot, realFile))}`
    : undefined

  return {
    cleanId,
    file: realFile,
    key,
    lookupFiles: unique([file, realFile]),
    lookupIds: unique([
      id,
      cleanId,
      unwrappedId,
      file,
      realFile,
      realFile ? `/@fs/${realFile}` : undefined,
      relativeUrl,
    ]),
  }
}

export function hasSameViteModuleIdentity(
  left: string | null | undefined,
  right: string | null | undefined,
  root = process.cwd(),
) {
  if (!left || !right) {
    return false
  }
  return resolveViteModuleIdentity(left, root).key === resolveViteModuleIdentity(right, root).key
}
