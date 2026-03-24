import type { Plugin } from 'vite'
import process from 'node:process'
import defu from 'defu'
import fs from 'fs-extra'
import path from 'pathe'

type DebugStage = 'pre' | 'normal' | 'post'
type MatchRule = string | RegExp | ((id: string) => boolean)
type DebugWriteType = 'transform' | 'bundle'

interface DebugMetaEntry {
  file: string
  id: string
  stage: DebugStage
  type: DebugWriteType
}

interface DebugManifest {
  'pre': DebugMetaEntry[]
  'normal': DebugMetaEntry[]
  'post': DebugMetaEntry[]
  'bundle-pre': DebugMetaEntry[]
  'bundle-normal': DebugMetaEntry[]
  'bundle-post': DebugMetaEntry[]
}

interface DebugOptions {
  cwd?: string
  log?: boolean
  enabled?: boolean
  targetDir?: string
  stages?: DebugStage[]
  include?: MatchRule | MatchRule[]
  exclude?: MatchRule | MatchRule[]
  skipPlatforms?: string[]
  onError?: (error: unknown, context: { stage: DebugStage, type: DebugWriteType, id: string }) => void
}

const HASH_RE = /#.*$/u
const INVALID_FS_CHARS_RE = /[<>:"|?*\0]/g
const BACKSLASH_RE = /\\/g
const VIRTUAL_MODULE_PREFIX = '\u0000'
const QUERY_SPLIT_RE = /\?/u
const NON_WORD_RE = /[^\w.-]+/g
const DUPLICATE_UNDERSCORE_RE = /_+/g
const TRIM_UNDERSCORE_RE = /^_+|_+$/g

export function debugX(options?: DebugOptions): Plugin[] {
  const {
    cwd = process.cwd(),
    log = process.env.DEBUG_UNI_APP_X_LOG === 'true',
    enabled = process.env.DEBUG_UNI_APP_X === 'true',
    targetDir = '.debug',
    stages = ['pre', 'normal', 'post'],
    include,
    exclude,
    skipPlatforms = [],
    onError,
  } = options ?? {}

  const currentPlatform = process.env.UNI_UTS_PLATFORM ?? process.env.UNI_PLATFORM
  const isEnabled = enabled && !skipPlatforms.includes(currentPlatform ?? '')
  const enabledStages = new Set(stages)
  const includes = toRules(include)
  const excludes = toRules(exclude)
  const stageMeta = new Map<string, Map<string, DebugMetaEntry>>()

  function splitId(id: string) {
    const withoutHash = id.replace(HASH_RE, '')
    const [filename, query = ''] = withoutHash.split(QUERY_SPLIT_RE)
    return { filename, query }
  }

  function replaceVirtualPrefix(id: string) {
    return id.split(VIRTUAL_MODULE_PREFIX).join('virtual/')
  }

  function toSafeRelativePath(id: string) {
    const { filename, query } = splitId(id)
    const devirtualized = replaceVirtualPrefix(filename)
    const normalized = path.normalize(devirtualized)
    const nodeModulesIndex = normalized.indexOf('node_modules')
    let candidate: string
    if (nodeModulesIndex > -1) {
      candidate = normalized.slice(nodeModulesIndex)
    }
    else if (path.isAbsolute(normalized)) {
      candidate = path.relative(cwd, normalized)
    }
    else {
      candidate = normalized
    }

    const sanitized = candidate
      .replace(BACKSLASH_RE, '/')
      .replace(INVALID_FS_CHARS_RE, '_')
    const segments = sanitized
      .split('/')
      .filter(segment => segment && segment !== '.' && segment !== '..')
    const basePath = segments.join('/') || 'virtual-module'
    if (!query) {
      return basePath
    }

    const querySuffix = query
      .replace(NON_WORD_RE, '_')
      .replace(DUPLICATE_UNDERSCORE_RE, '_')
      .replace(TRIM_UNDERSCORE_RE, '')

    return querySuffix ? `${basePath}__${querySuffix}` : basePath
  }

  function n(id: string) {
    return toSafeRelativePath(id)
  }

  function toRules(value?: MatchRule | MatchRule[]) {
    if (value === undefined) {
      return []
    }
    return Array.isArray(value) ? value : [value]
  }

  function matchesRule(id: string, rule: MatchRule) {
    if (typeof rule === 'string') {
      return id.includes(rule)
    }
    if (rule instanceof RegExp) {
      return rule.test(id)
    }
    return rule(id)
  }

  function shouldWrite(id: string, stage: DebugStage) {
    if (!isEnabled || !enabledStages.has(stage)) {
      return false
    }

    if (includes.length > 0 && !includes.some(rule => matchesRule(id, rule))) {
      return false
    }

    if (excludes.some(rule => matchesRule(id, rule))) {
      return false
    }

    return true
  }

  async function writeDebugFile(
    filePath: string,
    content: string | Uint8Array,
    context: { stage: DebugStage, type: DebugWriteType, id: string },
  ) {
    try {
      await fs.outputFile(filePath, content, 'utf8')
    }
    catch (error) {
      onError?.(error, context)
    }
  }

  function getMetaEntries(metaFilePath: string) {
    return [...(stageMeta.get(metaFilePath)?.values() ?? [])]
  }

  function createManifest(): DebugManifest {
    return {
      'pre': [],
      'normal': [],
      'post': [],
      'bundle-pre': [],
      'bundle-normal': [],
      'bundle-post': [],
    }
  }

  function pushMeta(metaFilePath: string, manifestKey: keyof DebugManifest, entry: DebugMetaEntry) {
    const list = stageMeta.get(metaFilePath) ?? new Map<string, DebugMetaEntry>()
    list.set(entry.file, entry)
    stageMeta.set(metaFilePath, list)

    const manifestFilePath = path.join(cwd, targetDir, '_manifest.json')
    const manifestEntries = stageMeta.get(manifestFilePath) ?? new Map<string, DebugMetaEntry>()
    manifestEntries.set(`${manifestKey}:${entry.file}`, entry)
    stageMeta.set(manifestFilePath, manifestEntries)
  }

  async function flushMeta(metaFilePath: string, stage: DebugStage, manifestKey?: keyof DebugManifest) {
    const entries = getMetaEntries(metaFilePath)
    if (entries.length === 0) {
      return
    }

    await writeDebugFile(
      metaFilePath,
      `${JSON.stringify(entries, null, 2)}\n`,
      { stage, type: 'bundle', id: '_meta.json' },
    )

    if (!manifestKey) {
      return
    }

    const manifest = createManifest()
    for (const [scopeKey, entry] of stageMeta.get(path.join(cwd, targetDir, '_manifest.json'))?.entries() ?? []) {
      const separatorIndex = scopeKey.indexOf(':')
      const scope = scopeKey.slice(0, separatorIndex) as keyof DebugManifest
      manifest[scope].push(entry)
    }

    await writeDebugFile(
      path.join(cwd, targetDir, '_manifest.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
      { stage, type: 'bundle', id: '_manifest.json' },
    )
  }

  function createPlugin(options?: { enforce?: 'pre' | 'post' }): Plugin {
    const { enforce } = defu(options, {})
    const prefix = enforce === undefined ? 'normal' : enforce

    return {
      name: `weapp-tailwindcss:debug:${prefix}`,
      enforce,
      async transform(code, id) {
        if (!shouldWrite(id, prefix)) {
          return
        }

        const relativeFile = n(id)
        await writeDebugFile(
          path.join(cwd, targetDir, prefix, relativeFile),
          code,
          { stage: prefix, type: 'transform', id },
        )
        pushMeta(
          path.join(cwd, targetDir, prefix, '_meta.json'),
          prefix,
          {
            file: relativeFile,
            id,
            stage: prefix,
            type: 'transform',
          },
        )
        await flushMeta(path.join(cwd, targetDir, prefix, '_meta.json'), prefix, prefix)
      },
      async generateBundle(_options, bundle) {
        if (!isEnabled || !enabledStages.has(prefix)) {
          return
        }

        const bundleKeys = Object.keys(bundle)
        if (log) {
          console.log('generateBundle\n', bundleKeys)
        }
        const dir = `bundle-${prefix}`
        const matchedBundleKeys = bundleKeys.filter(file => shouldWrite(file, prefix))
        if (matchedBundleKeys.length === 0) {
          return
        }

        const metaFilePath = path.join(cwd, targetDir, dir, '_meta.json')
        await writeDebugFile(
          path.join(cwd, targetDir, dir, '_keys.txt'),
          matchedBundleKeys.sort().join('\n'),
          { stage: prefix, type: 'bundle', id: '_keys.txt' },
        )
        const tasks: Promise<unknown>[] = []
        for (const file of matchedBundleKeys) {
          const item = bundle[file]
          if (item.type === 'asset') {
            const relativeFile = path.join('asset', n(file))
            tasks.push(
              writeDebugFile(
                path.join(cwd, targetDir, dir, relativeFile),
                item.source,
                { stage: prefix, type: 'bundle', id: file },
              ),
            )
            pushMeta(metaFilePath, dir as keyof DebugManifest, {
              file: relativeFile,
              id: file,
              stage: prefix,
              type: 'bundle',
            })
          }
          else if (item.type === 'chunk') {
            const relativeFile = path.join('chunk', n(file))
            tasks.push(
              writeDebugFile(
                path.join(cwd, targetDir, dir, relativeFile),
                item.code,
                { stage: prefix, type: 'bundle', id: file },
              ),
            )
            pushMeta(metaFilePath, dir as keyof DebugManifest, {
              file: relativeFile,
              id: file,
              stage: prefix,
              type: 'bundle',
            })
          }
        }
        await Promise.all(tasks)
        await flushMeta(metaFilePath, prefix, dir as keyof DebugManifest)
      },
    }
  }

  return [
    createPlugin({ enforce: 'pre' }),
    createPlugin(),
    createPlugin({ enforce: 'post' }),
  ]
}
