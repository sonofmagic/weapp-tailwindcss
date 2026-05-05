import type { ResolvedConfig } from 'vite'
import type { InternalUserDefinedOptions } from '@/types'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { generateCssByGenerator, hasTailwindGeneratedCssMarkers } from '../shared/generator-css'

interface WriteBundleContext {
  opts: InternalUserDefinedOptions
  runtimeState: {
    twPatcher: InternalUserDefinedOptions['twPatcher']
    patchPromise: Promise<void>
  }
  ensureRuntimeClassSet: (force?: boolean) => Promise<Set<string>>
  debug: (format: string, ...args: unknown[]) => void
  getResolvedConfig: () => ResolvedConfig | undefined
}

const SKIPPED_DIRS = new Set([
  '.git',
  '.svn',
  'node_modules',
])

async function collectCssFiles(root: string, cssMatcher: InternalUserDefinedOptions['cssMatcher']) {
  const files: string[] = []
  async function walk(dir: string) {
    let entries: Awaited<ReturnType<typeof readdir>>
    try {
      entries = await readdir(dir, { withFileTypes: true })
    }
    catch {
      return
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRS.has(entry.name)) {
          await walk(path.join(dir, entry.name))
        }
        continue
      }
      if (!entry.isFile()) {
        continue
      }
      const file = path.join(dir, entry.name)
      if (cssMatcher(file)) {
        files.push(file)
      }
    }
  }

  await walk(root)
  return files
}

function toOutputFile(root: string, file: string) {
  return path.relative(root, file).split(path.sep).join('/')
}

export function createWriteBundleHook(context: WriteBundleContext) {
  return async function writeBundle() {
    const {
      opts,
      runtimeState,
      ensureRuntimeClassSet,
      debug,
      getResolvedConfig,
    } = context
    const resolvedConfig = getResolvedConfig()
    if (!resolvedConfig || resolvedConfig.command !== 'build') {
      return
    }

    const rootDir = resolvedConfig.root ? path.resolve(resolvedConfig.root) : process.cwd()
    const outDir = resolvedConfig.build?.outDir
      ? path.resolve(rootDir, resolvedConfig.build.outDir)
      : rootDir
    const files = await collectCssFiles(outDir, opts.cssMatcher)
    if (files.length === 0) {
      return
    }

    const runtime = await ensureRuntimeClassSet()
    let transformed = 0
    await Promise.all(files.map(async (absoluteFile) => {
      const rawSource = await readFile(absoluteFile, 'utf8')
      if (!hasTailwindGeneratedCssMarkers(rawSource)) {
        return
      }

      const file = toOutputFile(outDir, absoluteFile)
      const cssHandlerOptions = {
        isMainChunk: opts.mainCssChunkMatcher(file, opts.appType),
        postcssOptions: {
          options: {
            from: file,
          },
        },
        majorVersion: runtimeState.twPatcher.majorVersion,
      }
      const cssUserHandlerOptions = {
        ...cssHandlerOptions,
        isMainChunk: false,
      }
      const generated = await generateCssByGenerator({
        opts,
        runtimeState,
        runtime,
        rawSource,
        file,
        cssHandlerOptions,
        cssUserHandlerOptions,
        styleHandler: opts.styleHandler,
        debug,
      })
      const nextCss = generated?.css ?? (await opts.styleHandler(rawSource, cssHandlerOptions)).css
      if (nextCss !== rawSource) {
        await writeFile(absoluteFile, nextCss, 'utf8')
        transformed += 1
        opts.onUpdate(file, rawSource, nextCss)
        debug('writeBundle css fallback handle: %s', file)
      }
    }))

    if (transformed > 0) {
      debug('writeBundle css fallback transformed=%d total=%d', transformed, files.length)
    }
  }
}
