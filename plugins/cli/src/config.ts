import path from 'node:path'
import { cosmiconfigSync } from 'cosmiconfig'
import defu from 'defu'
import type { UserDefinedOptions } from 'weapp-tailwindcss'
import fs from 'fs-extra'

export function createConfigLoader(root: string = process.cwd()) {
  const explorer = cosmiconfigSync('weapp-tw')

  function search(searchFrom: string = root) {
    const searchFor = explorer.search(searchFrom)
    if (searchFor) {
      searchFor.config = defu<UserConfig, UserConfig[]>(searchFor.config, getDefaultConfig(root))
      return searchFor
    }
  }

  function load(filepath: string) {
    return explorer.load(filepath)
  }

  return {
    search,
    load
  }
}

export function getDefaultConfig(root: string): UserConfig {
  return {
    outDir: 'dist',
    root,
    srcDir: '.'
  }
}

export type UserConfig = {
  outDir?: string
  root?: string
  srcDir?: string
  weappTailwindcssOptions?: UserDefinedOptions
  clean?: boolean
}

export function defineConfig(options: UserConfig) {
  return options
}

export interface InitConfigOptions {
  lang?: 'js' | 'ts'
  root?: string
}

export function initConfig(options?: InitConfigOptions) {
  const { lang, root } = defu<InitConfigOptions, InitConfigOptions[]>(options, { lang: 'js', root: process.cwd() }) as Required<InitConfigOptions>
  const configFilename = `weapp-tw.config.${lang ?? 'js'}`
  const configPath = path.resolve(root, configFilename)
  fs.ensureDirSync(root)
  if (lang === 'ts') {
    fs.writeFileSync(
      configPath,
      `import { defineConfig } from '@weapp-tailwindcss/cli'

export default defineConfig({})
`,
      'utf8'
    )
  } else {
    fs.writeFileSync(
      configPath,
      `/** @type {import('@weapp-tailwindcss/cli').UserConfig} */
module.exports = {}
`,
      'utf8'
    )
  }
  console.log(`✨ ${configFilename} init successfully!`)
  return configPath
}
