import fs from 'node:fs/promises'
import path from 'pathe'

const CSS_IMPORT_RE = /@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?/gi

export async function collectMiniProgramStyleFiles(root: string, extensions: string[]) {
  const styleFiles: string[] = []
  const normalizedExtensions = new Set(extensions.map(extension => extension.toLowerCase()))

  async function visit(directory: string) {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    await Promise.all(entries.map(async (entry) => {
      const target = path.resolve(directory, entry.name)
      if (entry.isDirectory()) {
        await visit(target)
      }
      else if (entry.isFile() && normalizedExtensions.has(path.extname(entry.name).toLowerCase())) {
        styleFiles.push(target)
      }
    }))
  }

  await visit(root)
  return styleFiles.sort()
}

export async function resolveMiniProgramRuntimeStyleEntry(root: string, extensions: string[]) {
  const normalizedExtensions = new Set(extensions.map(extension => extension.toLowerCase()))
  const entries = await fs.readdir(root, { withFileTypes: true })
  const rootChunkStems = new Set(entries.filter(entry =>
    entry.isFile() && ['.js', '.mjs', '.cjs'].includes(path.extname(entry.name).toLowerCase()),
  ).map(entry => path.basename(entry.name, path.extname(entry.name))))
  const candidates = entries.filter(entry =>
    entry.isFile()
    && normalizedExtensions.has(path.extname(entry.name).toLowerCase())
    && rootChunkStems.has(path.basename(entry.name, path.extname(entry.name))),
  )
  return candidates.length === 1 ? path.resolve(root, candidates[0]!.name) : undefined
}

export async function readReachableMiniProgramStyles(root: string, entryFile: string, extensions: string[]) {
  const normalizedRoot = path.resolve(root)
  const normalizedExtensions = new Set(extensions.map(extension => extension.toLowerCase()))
  const visited = new Set<string>()
  const sources: string[] = []

  async function visit(file: string) {
    const normalizedFile = path.resolve(file)
    const relative = path.relative(normalizedRoot, normalizedFile)
    if (relative.startsWith('..') || path.isAbsolute(relative) || visited.has(normalizedFile)) {
      return
    }
    visited.add(normalizedFile)
    const source = await fs.readFile(normalizedFile, 'utf8')
    sources.push(source)
    const importPattern = new RegExp(CSS_IMPORT_RE.source, CSS_IMPORT_RE.flags)
    for (const match of source.matchAll(importPattern)) {
      const request = match[1]?.split(/[?#]/, 1)[0]
      if (!request || /^(?:https?:)?\/\//i.test(request) || request.startsWith('data:')) {
        continue
      }
      const importedFile = path.resolve(path.dirname(normalizedFile), request)
      if (normalizedExtensions.has(path.extname(importedFile).toLowerCase())) {
        await visit(importedFile)
      }
    }
  }

  await visit(entryFile)
  return sources.join('\n')
}
