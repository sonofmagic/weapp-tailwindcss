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
  /**
   * @group 0.重要配置
   * @description 传递给 `weapp-tailwindcss` 的选项, [参考配置](/docs/api/interfaces/UserDefinedOptions)
   */
  weappTailwindcssOptions: UserDefinedOptions
  /**
   * @group 1.打包配置
   * @default `dist`
   * @description 输出目录
   */
  outDir: string
  /**
   * @group 1.打包配置
   * @default `process.cwd()`
   * @description 根目录
   */
  root: string
  /**
   * @group 3.一般配置
   * @default `true`
   * @description build 的时候是否清除
   */
  clean: boolean
  /**
   * @group 1.打包配置
   * @default `.`
   * @description src 目录，相对路径，通常用于原生 typescript 项目
   */
  src: string
  /**
   * @group 1.打包配置
   * @description 排除的文件目录
   */
  exclude: string[] | ((type: AssetType) => string[])
  /**
   * @group 1.打包配置
   * @description 包括的文件目录
   */
  include: string[] | ((type: AssetType) => string[])
  /**
   * @group 1.打包配置
   * @description 包括的文件后缀分类
   */
  extensions: {
    javascript?: string[]
    html?: string[]
    css?: string[]
    json?: string[]
  }
  /**
   * @group 1.打包配置
   * @description postcss 配置，默认会去请求 `root` 下的 `postcss.config.js`
   */
  postcssOptions?: Partial<Omit<Result, 'file'>>
  /**
   * @group 2.编译支持
   * @description 预处理配置，支持 sass 和 less，需要传入来开启编译
   * @description 启用 sass 需要安装 sass, less 同样
   */
  preprocessorOptions?: {
    sass?: boolean | GulpSassOptions
    less?: boolean | GulpLessOptions
  }
  /**
   * @group 1.打包配置
   * @description weapp-tw dev 的 watch 配置
   */
  watchOptions: WatchOptions
  /**
   * @group 2.编译支持
   * @description typescript 的编译配置，默认不传伟不编译 ts
   * @description 需要安装 typescript
   */
  typescriptOptions:
    | boolean
    | {
      settings?: Settings
      tsConfigFileName?: string
    }
}

export type UserConfig = Partial<BuildOptions>
