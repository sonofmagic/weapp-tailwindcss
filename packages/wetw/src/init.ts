import { constants } from 'node:fs'
import { access, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { DEFAULT_OUT_DIR } from './config'

export interface WriteConfigOptions {
  cwd?: string
  configFile?: string
  force?: boolean
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

function buildConfigTemplate(outDir: string) {
  return `import { defineConfig } from 'wetw'

export default defineConfig({
  outDir: '${outDir}',
  // registry: 'https://example.com/wetw/registry.json',
})
`
}

export async function writeDefaultConfig(options: WriteConfigOptions = {}) {
  const cwd = resolve(options.cwd ?? process.cwd())
  const configFile = resolve(cwd, options.configFile ?? 'wetw.config.ts')

  if ((await configExists(configFile)) && !options.force) {
    throw new Error(`Config already exists at ${configFile}`)
  }

  await mkdir(dirname(configFile), { recursive: true })
  await writeFile(configFile, buildConfigTemplate(DEFAULT_OUT_DIR), 'utf8')

  return configFile
}
