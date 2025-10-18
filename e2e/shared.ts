import type { TailwindcssPatcherOptions } from 'tailwindcss-patch'
import fs from 'node:fs/promises'
import process from 'node:process'
import { getConfig } from '@tailwindcss-mangle/config'
import path from 'pathe'
import prettier from 'prettier'
import { TailwindcssPatcher } from 'tailwindcss-patch'
import { removeWxmlId } from '../packages/weapp-tailwindcss/test/util'

export {
  removeWxmlId,
}

export async function loadCss(p: string) {
  const css = await fs.readFile(p, 'utf8')
  const code = await prettier.format(css, {
    parser: 'css',
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true,
    endOfLine: 'lf',
    trailingComma: 'none',
    printWidth: 180,
    bracketSameLine: true,
    htmlWhitespaceSensitivity: 'ignore',
  })
  return code
}

export interface ProjectEntry {
  name: string
  projectPath: string
  cssFile: string
  url?: string
  skipOpenAutomator?: boolean
}

export function wait(ts = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined)
    }, ts)
  })
}

export function projectFilter(x: ProjectEntry[]) {
  return x
}

export function formatWxml(wxml: string) {
  return prettier.format(wxml, {
    parser: 'html',
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true,
    endOfLine: 'lf',
    trailingComma: 'none',
    printWidth: 180,
    bracketSameLine: true,
    htmlWhitespaceSensitivity: 'ignore',
  })
}

export function twExtract(root: string) {
  let task = extractionTasks.get(root)
  if (!task) {
    task = runTwExtract(root)
    extractionTasks.set(root, task)
  }
  return task
}

export async function resolveSnapshotFile(testDir: string, suite: string, projectName: string, fileName: string) {
  const snapshotDir = path.resolve(testDir, '__snapshots__', suite, projectName)
  await fs.mkdir(snapshotDir, { recursive: true })
  return path.resolve(snapshotDir, fileName)
}

type NormalizedPatchOptions = NonNullable<TailwindcssPatcherOptions['patch']>

const extractionTasks = new Map<string, Promise<void>>()

async function runTwExtract(root: string) {
  const { config } = await getConfig(root)
  if (!config) {
    return
  }

  const patchOptions = normalizePatchOptions(root, config.patch)
  if (await shouldSkipExtraction(patchOptions)) {
    return
  }

  const twPatcher = new TailwindcssPatcher({
    patch: patchOptions,
  })

  const originalCwd = process.cwd()
  try {
    if (originalCwd !== root) {
      process.chdir(root)
    }
    await twPatcher.extract()
  }
  finally {
    if (process.cwd() !== originalCwd) {
      process.chdir(originalCwd)
    }
  }
}

function normalizePatchOptions(root: string, patchOptions: NormalizedPatchOptions | undefined): NormalizedPatchOptions {
  const resolved: NormalizedPatchOptions = {
    ...(patchOptions ?? {}),
  }

  resolved.cwd = resolved.cwd ?? root
  resolved.basedir = resolved.basedir ?? root

  const resolvePaths = new Set(
    [
      ...(resolved.resolve?.paths ?? []),
      root,
    ].map(entry => normalizePath(root, entry)),
  )

  resolved.resolve = {
    ...resolved.resolve,
    paths: Array.from(resolvePaths),
  }

  if (resolved.output?.filename) {
    resolved.output = {
      ...resolved.output,
      filename: normalizePath(root, resolved.output.filename),
    }
  }

  if (resolved.cache && typeof resolved.cache === 'object') {
    resolved.cache = {
      ...resolved.cache,
      dir: resolved.cache.dir ? normalizePath(root, resolved.cache.dir) : resolved.cache.dir,
      cwd: resolved.cache.cwd ? normalizePath(root, resolved.cache.cwd) : resolved.cache.cwd,
      file: resolved.cache.file ? normalizePath(root, resolved.cache.file) : resolved.cache.file,
    }
  }

  if (resolved.tailwindcss) {
    const tw = { ...resolved.tailwindcss }

    if (typeof tw.config === 'string') {
      tw.config = normalizePath(root, tw.config)
    }

    if (tw.v4) {
      const v4 = { ...tw.v4 }
      if (Array.isArray(v4.cssEntries)) {
        v4.cssEntries = v4.cssEntries.map(entry => normalizePath(root, entry))
      }
      if (typeof v4.css === 'string') {
        v4.css = normalizePath(root, v4.css)
      }
      if (typeof v4.base === 'string') {
        v4.base = normalizePath(root, v4.base)
      }
      if (Array.isArray(v4.sources)) {
        v4.sources = v4.sources.map((source) => {
          if (source && typeof source.base === 'string') {
            return {
              ...source,
              base: normalizePath(root, source.base),
            }
          }
          return source
        })
      }
      tw.v4 = v4
    }

    resolved.tailwindcss = tw
  }

  return resolved
}

function normalizePath(root: string, target: string) {
  return path.isAbsolute(target) ? target : path.resolve(root, target)
}

async function shouldSkipExtraction(patchOptions: NormalizedPatchOptions) {
  if (process.env.E2E_FORCE_EXTRACT === 'true') {
    return false
  }

  const output = patchOptions.output?.filename
  if (!output) {
    return false
  }

  let outputStat
  try {
    outputStat = await fs.stat(output)
  }
  catch (error: any) {
    if (error?.code === 'ENOENT') {
      return false
    }
    throw error
  }

  if (!outputStat.isFile()) {
    return false
  }

  const latestInputTime = await resolveLatestInputMtime(patchOptions)
  if (latestInputTime === null) {
    return false
  }

  return latestInputTime <= outputStat.mtimeMs
}

async function resolveLatestInputMtime(patchOptions: NormalizedPatchOptions) {
  const inputs = new Set<string>()
  const { tailwindcss } = patchOptions

  if (typeof tailwindcss?.config === 'string') {
    inputs.add(tailwindcss.config)
  }

  if (tailwindcss?.v4) {
    const { v4 } = tailwindcss
    if (Array.isArray(v4.cssEntries)) {
      v4.cssEntries.forEach(entry => inputs.add(entry))
    }
    if (typeof v4.css === 'string') {
      inputs.add(v4.css)
    }
    if (typeof v4.base === 'string') {
      inputs.add(v4.base)
    }
    if (Array.isArray(v4.sources)) {
      for (const source of v4.sources) {
        if (source && typeof source.base === 'string') {
          inputs.add(source.base)
        }
      }
    }
  }

  if (inputs.size === 0) {
    return null
  }

  let latest = 0
  for (const input of inputs) {
    try {
      const stat = await fs.stat(input)
      if (!(stat.isFile() || stat.isSymbolicLink())) {
        return null
      }
      latest = Math.max(latest, stat.mtimeMs)
    }
    catch (error: any) {
      if (error?.code === 'ENOENT') {
        return null
      }
      throw error
    }
  }
  return latest
}
