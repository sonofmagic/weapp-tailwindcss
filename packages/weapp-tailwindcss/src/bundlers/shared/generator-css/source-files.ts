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
  },
) {
  const bases = [
    sourceOptions.projectRoot,
    sourceOptions.cwd,
    process.cwd(),
  ].filter((item): item is string => typeof item === 'string' && item.length > 0)
  const strippedFile = stripStyleExtension(file)
  const relativeFiles = new Set<string>()
  const addKnownOutputRelativePath = (relative: string) => {
    const parts = relative.split(/[\\/]/).filter(Boolean)
    const distIndex = parts.lastIndexOf('dist')
    if (distIndex === -1 || distIndex >= parts.length - 1) {
      return
    }
    const outputRest = parts.slice(distIndex + 1)
    const knownOutputRoots = [
      ['dev'],
      ['build'],
      ['dev', 'mp-weixin'],
      ['build', 'mp-weixin'],
    ]
    for (const outputRoot of knownOutputRoots) {
      if (
        outputRest.length > outputRoot.length
        && outputRoot.every((segment, index) => outputRest[index] === segment)
      ) {
        relativeFiles.add(outputRest.slice(outputRoot.length).join(path.sep))
      }
    }
  }

  if (path.isAbsolute(strippedFile)) {
    for (const base of bases) {
      const relative = path.relative(base, strippedFile)
      if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
        continue
      }
      relativeFiles.add(relative)
      addKnownOutputRelativePath(relative)
    }
  }
  else {
    relativeFiles.add(strippedFile)
    addKnownOutputRelativePath(strippedFile)
    const parts = strippedFile.split(/[\\/]/).filter(Boolean)
    for (const outputRoot of [
      ['dev'],
      ['build'],
      ['dev', 'mp-weixin'],
      ['build', 'mp-weixin'],
    ]) {
      if (
        parts.length > outputRoot.length
        && outputRoot.every((segment, index) => parts[index] === segment)
      ) {
        relativeFiles.add(parts.slice(outputRoot.length).join(path.sep))
      }
    }
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
