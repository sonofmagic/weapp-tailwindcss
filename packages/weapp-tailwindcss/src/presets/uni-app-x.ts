import type { PackageResolvingOptions } from 'local-pkg'
import type { UniAppXComponentLocalStylesOptions, UserDefinedOptions } from '@/types'
import process from 'node:process'
import { logger } from '@/logger'
import { getTailwindcssPackageInfo } from '@/tailwindcss'
import { resolveUniAppXOptions } from '@/uni-app-x/options'
import { defuOverrideArray, resolveUniUtsPlatform } from '@/utils'
import { normalizeCssEntries } from './shared'

export interface UniAppXOptions {
  /**
   * uni-app x 工程根目录。
   */
  base: string
  /**
   * 指定 Tailwind CSS v4 的入口 CSS。
   */
  cssEntries?: string[]
  /**
   * rem 转 rpx 配置。
   */
  rem2rpx?: UserDefinedOptions['rem2rpx']
  /**
   * 长度单位转 px 配置。
   */
  unitsToPx?: UserDefinedOptions['unitsToPx']
  /**
   * 透传原始插件配置。
   */
  rawOptions?: UserDefinedOptions
  /**
   * 自定义包解析路径。
   */
  resolve?: PackageResolvingOptions
  /**
   * 自定义模板属性转换规则。
   */
  customAttributes?: UserDefinedOptions['customAttributes']
  /**
   * 直接控制 `uniAppX.componentLocalStyles` 的快捷入口。
   *
   * @remarks
   * 默认开启；默认仅在 `manifest.json` 的 `styleIsolationVersion=2` 时启用。
   */
  uniAppX?: UserDefinedOptions['uniAppX']
  /**
   * issue #822 组件局部样式能力的快捷开关。
   *
   * @remarks
   * 等价于设置 `uniAppX.componentLocalStyles`。
   */
  componentLocalStyles?: boolean | UniAppXComponentLocalStylesOptions
}

function resolveTailwindResolveOptions(base: string, resolve?: PackageResolvingOptions): PackageResolvingOptions {
  const currentPaths = Array.isArray(resolve?.paths) ? resolve.paths : []
  return {
    ...(resolve ?? {}),
    paths: [...new Set([base, ...currentPaths])],
  }
}

function resolveInstalledTailwindDefaults(resolve?: PackageResolvingOptions) {
  const packageInfo = getTailwindcssPackageInfo(resolve)
  const version = packageInfo?.version
  if (!version) {
    return undefined
  }

  const major = Number.parseInt(version.split('.')[0] ?? '', 10)
  if (!Number.isFinite(major)) {
    return undefined
  }

  if (major === 4) {
    return {
      version: 4 as const,
      packageName: 'tailwindcss',
      postcssPlugin: '@tailwindcss/postcss',
    }
  }

  if (major === 3) {
    return {
      version: 3 as const,
      packageName: 'tailwindcss',
      postcssPlugin: 'tailwindcss',
    }
  }

  return undefined
}

export function uniAppX(options: UniAppXOptions) {
  logger.info(`UNI_PLATFORM: ${process.env.UNI_PLATFORM}`)
  const utsPlatform = resolveUniUtsPlatform()
  const uniPlatform = resolveUniUtsPlatform(process.env.UNI_PLATFORM)

  logger.info(`UNI_UTS_PLATFORM: ${utsPlatform.raw ?? 'undefined'}`)

  const isApp = utsPlatform.isApp || uniPlatform.isApp
  const cssEntries = normalizeCssEntries(options.cssEntries)
  const resolvedResolve = resolveTailwindResolveOptions(options.base, options.resolve)
  const installedTailwindDefaults = resolveInstalledTailwindDefaults(resolvedResolve)
  const resolvedUniAppX = resolveUniAppXOptions({
    enabled: isApp,
    componentLocalStyles: options.componentLocalStyles ?? true,
    ...(typeof options.uniAppX === 'object' ? options.uniAppX : {}),
  })
  if (typeof options.uniAppX === 'boolean') {
    resolvedUniAppX.enabled = options.uniAppX
  }
  return defuOverrideArray<
    Partial<UserDefinedOptions>,
    Partial<UserDefinedOptions>[]
  >(
    options.rawOptions ?? {},
    {
      uniAppX: resolvedUniAppX,
      rem2rpx: options.rem2rpx,
      unitsToPx: options.unitsToPx,
      tailwindcssBasedir: options.base,
      tailwindcssPatcherOptions: {
        projectRoot: options.base,
        tailwindcss: {
          ...(installedTailwindDefaults ?? {}),
          cwd: options.base,
          resolve: resolvedResolve,
          v3: {
            cwd: options.base,
          },
          v4: {
            base: options.base,
            cssEntries,
          },
        },
      },
      tailwindcss: {
        ...(installedTailwindDefaults ?? {}),
        resolve: resolvedResolve,
      },
      cssPreflight: {
        'border-style': false,
      },
      cssPresetEnv: {
        features: {
          'custom-properties': {
            preserve: false,
          },
        },
      },
      ...(options.customAttributes ? { customAttributes: options.customAttributes } : {}),
    },
  )
}
