import type { UserDefinedOptions } from 'weapp-tailwindcss'
import type { WatchOptions } from 'gulp'
import type { AssetType } from '@/enum'

export interface BuildOptions {
  weappTailwindcssOptions: UserDefinedOptions
  outDir: string
  root: string
  clean: boolean
  src: string
  exclude: string[] | ((type: AssetType) => string[])
  include: string[] | ((type: AssetType) => string[])
  extensions: {
    javascript: string[]
    html: string[]
    css: string[]
    json: string[]
  }
  watchOptions: WatchOptions
}
