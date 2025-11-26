import type { WetwFramework } from './types'
import { constants } from 'node:fs'
import { access, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { DEFAULT_FRAMEWORK, DEFAULT_OUT_DIR } from './config'

export interface WriteConfigOptions {
  cwd?: string
  configFile?: string
  force?: boolean
  framework?: WetwFramework
}

async function configExists(path: string) {
  try {
    await access(path, constants.F_OK)
    return true
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false
    }
    throw error
  }
}

function buildConfigTemplate(outDir: string, framework: WetwFramework) {
  return `import { defineConfig } from 'wetw'

export default defineConfig({
  outDir: '${outDir}',
  framework: '${framework}',
  // registry: 'https://example.com/wetw/registry.json',
})
`
}

export async function writeDefaultConfig(options: WriteConfigOptions = {}) {
  const cwd = resolve(options.cwd ?? process.cwd())
  const configFile = resolve(cwd, options.configFile ?? 'wetw.config.ts')
  const framework = options.framework ?? DEFAULT_FRAMEWORK

  if ((await configExists(configFile)) && !options.force) {
    throw new Error(`Config already exists at ${configFile}`)
  }

  await mkdir(dirname(configFile), { recursive: true })
  await writeFile(
    configFile,
    buildConfigTemplate(DEFAULT_OUT_DIR, framework),
    'utf8',
  )

  return configFile
}
