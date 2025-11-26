import type { LoadWetwConfigOptions } from './config'
import type { ResolvedWetwConfig, WetwRegistryFile, WetwRegistryItem } from './types'
import { constants } from 'node:fs'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, resolve } from 'node:path'
import { loadWetwConfig } from './config'
import { resolveRegistry } from './registry'
import { isHttp } from './utils'

export interface AddComponentsOptions extends LoadWetwConfigOptions {
  force?: boolean
  registry?: WetwRegistryItem[]
}

async function pathExists(target: string) {
  try {
    await access(target, constants.F_OK)
    return true
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false
    }
    throw error
  }
}

async function getFileContent(file: WetwRegistryFile, config: ResolvedWetwConfig) {
  if ('content' in file && file.content !== undefined) {
    return file.content
  }

  if ('src' in file) {
    if (isHttp(file.src)) {
      const response = await fetch(file.src)
      if (!response.ok) {
        throw new Error(`Failed to download ${file.src}: ${response.statusText}`)
      }
      return response.text()
    }

    const from = isAbsolute(file.src) ? file.src : resolve(config.templatesRoot, file.src)
    return readFile(from, 'utf8')
  }

  throw new Error(`Invalid registry file entry for ${file.path}`)
}

async function writeFileSafely(target: string, content: string, force: boolean) {
  const exists = await pathExists(target)
  if (exists && !force) {
    throw new Error(`File already exists: ${target}`)
  }

  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, content, 'utf8')
}

export async function addComponents(names: string[], options: AddComponentsOptions = {}) {
  if (!names.length) {
    throw new Error('Please provide at least one component name')
  }

  const config = await loadWetwConfig({
    cwd: options.cwd,
    configFile: options.configFile,
    overrides: options.overrides,
  })

  const registry = options.registry ?? (await resolveRegistry(config))
  const registryMap = new Map(registry.map(item => [item.name, item]))

  for (const name of names) {
    const item = registryMap.get(name)
    if (!item) {
      throw new Error(`Component "${name}" not found in registry`)
    }

    for (const file of item.files) {
      const content = await getFileContent(file, config)
      const target = resolve(config.outDir, file.path)
      await writeFileSafely(target, content, options.force ?? false)
    }
  }

  return {
    added: names,
    outDir: config.outDir,
  }
}
