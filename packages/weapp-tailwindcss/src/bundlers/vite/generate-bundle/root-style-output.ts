import path from 'node:path'
import { normalizeOutputPathKey } from '@/bundlers/shared/module-graph'

export function isRootMiniProgramStyleOutputFile(file: string) {
  const normalized = normalizeOutputPathKey(file.replace(/[?#].*$/, ''))
  return !normalized.includes('/')
    && /\.(?:wxss|acss|ttss|qss|jxss|tyss)$/i.test(normalized)
}

export function createRelativeCssImportRequest(targetFile: string, importedFile: string) {
  const normalizedTargetFile = normalizeOutputPathKey(targetFile.replace(/[?#].*$/, ''))
  const normalizedImportedFile = normalizeOutputPathKey(importedFile.replace(/[?#].*$/, ''))
  const targetDir = path.posix.dirname(normalizedTargetFile)
  const baseDir = targetDir === '.' ? '' : targetDir
  const relative = path.posix.relative(baseDir, normalizedImportedFile)
  return relative.startsWith('.') ? relative : `./${relative}`
}

export function createCssImportShell(targetFile: string, importedFile: string) {
  return `@import "${createRelativeCssImportRequest(targetFile, importedFile)}";\n`
}

export function createRootMiniProgramOriginStyleOutputFile(file: string) {
  const normalized = normalizeOutputPathKey(file.replace(/[?#].*$/, ''))
  if (/(?:^|\/)[^/]+-origin\.[^.]+$/i.test(normalized)) {
    return normalized
  }
  return normalized.replace(/(\.[^.]+)$/, '-origin$1')
}

export function shouldKeepRootMiniProgramStyleAsImportShell(enabled: boolean | undefined) {
  return enabled === true
}

export function shouldMoveRootMiniProgramStyleToImportShellOrigin(enabled: boolean | undefined) {
  return enabled === true
}
