import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import {
  hasTailwindSourceDirectives,
  resolveCssEntrySource,
} from './directives'

const SOURCE_STYLE_EXTENSIONS = [
  '.vue',
  '.uvue',
  '.nvue',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.styl',
  '.stylus',
  '.wxss',
  '.acss',
  '.jxss',
  '.ttss',
  '.qss',
]
const SFC_STYLE_BLOCK_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi

function stripStyleExtension(file: string) {
  const normalized = file.replace(/[?#].*$/, '')
  return normalized.replace(/\.(?:wx|ac|jx|tt|q|c|ty)?ss$/i, '')
}

function createSourceStylePathCandidates(
  file: string,
  sourceOptions: {
    projectRoot?: string
    cwd?: string
    outputRoot?: string
  },
) {
  const bases = [
    sourceOptions.projectRoot,
    sourceOptions.cwd,
    process.cwd(),
  ].filter((item): item is string => typeof item === 'string' && item.length > 0)
  const outputRoots = [
    sourceOptions.outputRoot,
  ].filter((item): item is string => typeof item === 'string' && item.length > 0)
  const strippedFile = stripStyleExtension(file)
  const relativeFiles = new Set<string>()
  const addOutputRelativePath = (absoluteFile: string) => {
    for (const outputRoot of outputRoots) {
      const relative = path.relative(outputRoot, absoluteFile)
      if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
        continue
      }
      relativeFiles.add(relative)
    }
  }

  if (path.isAbsolute(strippedFile)) {
    addOutputRelativePath(strippedFile)
    for (const base of bases) {
      const relative = path.relative(base, strippedFile)
      if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
        continue
      }
      relativeFiles.add(relative)
    }
  }
  else {
    relativeFiles.add(strippedFile)
  }

  const candidates = new Set<string>()

  for (const relativeFile of relativeFiles) {
    if (!relativeFile || path.isAbsolute(relativeFile)) {
      continue
    }
    for (const base of bases) {
      for (const sourceRoot of ['', 'src']) {
        const prefix = sourceRoot ? path.resolve(base, sourceRoot, relativeFile) : path.resolve(base, relativeFile)
        for (const extension of SOURCE_STYLE_EXTENSIONS) {
          candidates.add(`${prefix}${extension}`)
        }
      }
    }
  }

  return [...candidates]
}

function extractStyleDirectiveSources(source: string) {
  const styleSources: string[] = []
  SFC_STYLE_BLOCK_RE.lastIndex = 0
  let match = SFC_STYLE_BLOCK_RE.exec(source)
  while (match !== null) {
    const styleSource = match[1] ?? ''
    if (hasTailwindSourceDirectives(styleSource)) {
      styleSources.push(styleSource)
    }
    match = SFC_STYLE_BLOCK_RE.exec(source)
  }
  if (styleSources.length > 0) {
    return styleSources
  }
  return hasTailwindSourceDirectives(source) ? [source] : []
}

export interface SourceSideCssEntrySource {
  css: string
  config?: string | undefined
  configRequest?: string | undefined
  base: string
  file: string
}

export function resolveSourceSideCssEntrySource(
  file: string,
  sourceOptions: {
    projectRoot?: string
    cwd?: string
    outputRoot?: string
  },
  resolveOptions: { removeConfig?: boolean } = {},
): SourceSideCssEntrySource | undefined {
  for (const sourceFile of createSourceStylePathCandidates(file, sourceOptions)) {
    if (!existsSync(sourceFile)) {
      continue
    }
    try {
      const source = readFileSync(sourceFile, 'utf8')
      for (const styleSource of extractStyleDirectiveSources(source)) {
        const cssEntrySource = resolveCssEntrySource(styleSource, path.dirname(sourceFile), resolveOptions)
        if (cssEntrySource) {
          return {
            ...cssEntrySource,
            file: sourceFile,
          }
        }
      }
    }
    catch {
      continue
    }
  }
}
