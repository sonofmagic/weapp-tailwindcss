import type { UserDefinedOptions } from 'weapp-tailwindcss'
import type { WatchOptions } from 'gulp'
import type { Result } from 'postcss-load-config'
import type { Options as SassOptions } from 'sass'
import type { Settings } from 'gulp-typescript'
import type { AssetType } from '@/enum'

export interface GulpLessOptions {
  modifyVars?: object | undefined
  paths?: string[] | undefined
  plugins?: any[] | undefined
  relativeUrls?: boolean | undefined
}

export interface GulpSassOptions extends SassOptions<'sync'> {
  errLogToConsole?: boolean | undefined
  onSuccess?: ((css: string) => any) | undefined
  onError?: ((err: Error) => any) | undefined
  sync?: boolean | undefined
}

export interface BuildOptions {
  weappTailwindcssOptions: UserDefinedOptions
  outDir: string
  root: string
  clean: boolean
  src: string
  exclude: string[] | ((type: AssetType) => string[])
  include: string[] | ((type: AssetType) => string[])
  extensions: {
    javascript?: string[]
    html?: string[]
    css?: string[]
    json?: string[]
  }
  postcssOptions?: Partial<Omit<Result, 'file'>>
  preprocessorOptions?: {
    sass?: boolean | GulpSassOptions
    less?: boolean | GulpLessOptions
  }
  watchOptions: WatchOptions
  typescriptOptions:
    | boolean
    | {
        settings?: Settings
        tsConfigFileName?: string
      }
}

export type UserConfig = Partial<BuildOptions>
