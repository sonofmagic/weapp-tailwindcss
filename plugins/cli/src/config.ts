import { cosmiconfigSync } from 'cosmiconfig'
import defu from 'defu'
import type { UserDefinedOptions } from 'weapp-tailwindcss'

export function createConfigLoader() {
  const explorer = cosmiconfigSync('weapp-tw')

  function search(searchFrom?: string) {
    const searchFor = explorer.search(searchFrom)
    if (searchFor) {
      searchFor.config = defu<UserConfig, UserConfig[]>(searchFor.config, {
        outDir: 'dist',
        root: process.cwd(),
        srcDir: '.'
      })
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

export type UserConfig = {
  outDir?: string
  root?: string
  srcDir?: string
  weappTailwindcssOptions?: UserDefinedOptions
}

export function defineConfig(options: UserConfig) {
  return options
}
