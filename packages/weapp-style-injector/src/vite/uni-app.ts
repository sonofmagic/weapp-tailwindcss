import type { OutputAsset, OutputBundle, OutputOptions, PluginContext } from 'rollup'
import type { Plugin, PluginContainer, ResolvedConfig } from 'vite'
import type { ResolvedSubPackage, UniAppStyleScopeInput, UniAppSubPackageConfig } from '../uni-app'

import type { ViteWeappStyleInjectorOptions } from '../vite'
import fs from 'node:fs'

import path from 'node:path'
import process from 'node:process'
import { preprocessCSS } from 'vite'
import { resolveUniAppStyleScopes, splitUniAppStyleScopes } from '../uni-app'
import { toArray } from '../utils'
import weappStyleInjector from '../vite'

export interface ViteUniAppStyleInjectorOptions extends Omit<ViteWeappStyleInjectorOptions, 'uniAppSubPackages'> {
  pagesJsonPath?: string | string[]
  subPackages?: UniAppSubPackageConfig | UniAppSubPackageConfig[]
  indexFileName?: string | string[]
  styleScopes?: UniAppStyleScopeInput | UniAppStyleScopeInput[]
}

function resolveDefaultPagesJsonPaths(): string[] {
  const cwd = process.cwd()
  return [
    path.resolve(cwd, 'src/pages.json'),
    path.resolve(cwd, 'pages.json'),
  ]
}

// 使用 Tailwind 插件的 transform 钩子时需要兼容多种写法，这里先抽象出统一的处理函数。
type TransformHandler = (this: PluginContext, code: string, id: string) => unknown

function getTransformHandler(hook: Plugin['transform'] | undefined): TransformHandler | undefined {
  if (!hook) {
    return undefined
  }

  if (typeof hook === 'function') {
    return hook as TransformHandler
  }

  if (typeof hook === 'object' && hook !== null && 'handler' in hook && typeof hook.handler === 'function') {
    return hook.handler as TransformHandler
  }

  return undefined
}

// 构建阶段生成分包入口样式时，提前触发 Tailwind 的 transform 逻辑并缓存结果
function createUniAppSubPackageIndexEmitter(subPackages: ResolvedSubPackage[]): Plugin {
  const existing = [...subPackages]
  if (existing.length === 0) {
    return {
      name: 'weapp-style-injector:uni-app-sub-packages',
      apply: 'build' as const,
    }
  }

  let resolvedConfig: ResolvedConfig | undefined
  let pluginContainer: PluginContainer | undefined
  let tailwindTransformHandler: TransformHandler | undefined
  const processedSourceCache = new Map<string, string>()
  const outputCache = new Map<string, string>()

  const transformContext = {
    addWatchFile() {},
  } as unknown as PluginContext

  // Vite 配置里 plugins 可能是多层嵌套数组，统一拍平成线性列表便于检索
  const flattenPlugins = (plugins: ReadonlyArray<Plugin | Plugin[] | null | undefined | false>): Plugin[] => {
    const flat: Plugin[] = []
    for (const entry of plugins) {
      if (Array.isArray(entry)) {
        flat.push(...flattenPlugins(entry))
      }
      else if (entry) {
        flat.push(entry)
      }
    }
    return flat
  }

  return {
    name: 'weapp-style-injector:uni-app-sub-packages',
    apply: 'build' as const,
    configResolved(config: ResolvedConfig) {
      resolvedConfig = config
      // Vite 在 build 阶段不会暴露 pluginContainer，这里通过类型断言尝试读取，失败时会退回到手动调用 Tailwind transform
      pluginContainer = (config as ResolvedConfig & { pluginContainer?: PluginContainer }).pluginContainer
      if (!tailwindTransformHandler) {
        const tailwindCandidates = flattenPlugins(config.plugins)
          .filter(entry => entry?.name === '@tailwindcss/vite:generate:build')
        const matched = tailwindCandidates.find(entry => typeof entry?.transform !== 'undefined')
        if (matched?.transform) {
          tailwindTransformHandler = getTransformHandler(matched.transform)
        }
      }
    },
    async generateBundle(_: OutputOptions, bundle: OutputBundle) {
      for (const entry of existing) {
        const sourcePath = entry.sourceAbsolutePath
        if (!fs.existsSync(sourcePath)) {
          continue
        }

        const fileName = entry.indexRelativePath
        let processedSource = outputCache.get(fileName)

        if (typeof processedSource === 'undefined') {
          const cacheKey = `${sourcePath}::${entry.preprocess !== false ? '1' : '0'}`
          processedSource = processedSourceCache.get(cacheKey)

          if (typeof processedSource === 'undefined') {
            let rawSource: string
            try {
              rawSource = await fs.promises.readFile(sourcePath, 'utf8')
            }
            catch {
              continue
            }

            if (entry.preprocess !== false && resolvedConfig) {
              try {
                let transformedSource = rawSource

                const initialResult = await preprocessCSS(transformedSource, sourcePath, resolvedConfig)
                transformedSource = initialResult.code

                const transformIds = new Set<string>([sourcePath, `${sourcePath}?direct`])

                if (pluginContainer) {
                  try {
                    const resolvedId = await pluginContainer.resolveId(sourcePath)
                    if (resolvedId?.id) {
                      transformIds.add(resolvedId.id)
                      transformIds.add(`${resolvedId.id}?direct`)
                    }
                  }
                  catch {
                    // ignore resolution errors and fall back to raw path
                  }
                }

                for (const id of transformIds) {
                  let transformResult: unknown

                  if (pluginContainer) {
                    transformResult = await pluginContainer.transform(transformedSource, id)
                  }
                  else if (tailwindTransformHandler) {
                    // 当无法获取 pluginContainer 时，直接调用 Tailwind 插件的 transform 以确保 @tailwind 指令被展开
                    transformResult = await tailwindTransformHandler.call(transformContext, transformedSource, id)
                  }

                  if (
                    transformResult
                    && typeof transformResult === 'object'
                    && 'code' in transformResult
                    && typeof (transformResult as { code?: unknown }).code === 'string'
                  ) {
                    transformedSource = (transformResult as { code: string }).code
                    break
                  }
                }

                const finalResult = await preprocessCSS(transformedSource, sourcePath, resolvedConfig)
                processedSource = finalResult.code
              }
              catch (error) {
                throw Object.assign(
                  new Error(`[weapp-style-injector] Failed to preprocess "${sourcePath}": ${(error as Error).message}`),
                  { cause: error },
                )
              }
            }
            else {
              processedSource = rawSource
            }

            processedSourceCache.set(cacheKey, processedSource)
          }

          outputCache.set(fileName, processedSource)
        }

        const existingAsset = bundle[fileName]
        if (existingAsset && existingAsset.type === 'asset') {
          existingAsset.source = processedSource
          continue
        }

        bundle[fileName] = {
          type: 'asset',
          name: fileName,
          fileName,
          source: processedSource,
        } as OutputAsset
      }
    },
  }
}

export function StyleInjector(options: ViteUniAppStyleInjectorOptions = {}) {
  const {
    pagesJsonPath,
    subPackages,
    indexFileName,
    styleScopes,
    ...rest
  } = options

  const configs = new Map<string, UniAppSubPackageConfig>()
  const { subPackages: scopedSubPackages, manual: manualStyleScopes } = splitUniAppStyleScopes(styleScopes)

  for (const entry of [...toArray(subPackages), ...scopedSubPackages]) {
    configs.set(path.resolve(entry.pagesJsonPath), entry)
  }

  const candidatePaths = pagesJsonPath
    ? toArray(pagesJsonPath).map(entry => path.resolve(entry))
    : resolveDefaultPagesJsonPaths()

  for (const candidate of candidatePaths) {
    if (!configs.has(candidate) && fs.existsSync(candidate)) {
      configs.set(candidate, {
        pagesJsonPath: candidate,
        indexFileName,
      })
    }
  }

  const entries = configs.size > 0 ? Array.from(configs.values()) : undefined
  const manualEntries = manualStyleScopes.length > 0 ? manualStyleScopes : undefined
  const resolvedSubPackages = resolveUniAppStyleScopes(entries, manualEntries)

  const plugins = [
    weappStyleInjector({
      ...rest,
      uniAppSubPackages: entries,
      uniAppStyleScopes: manualEntries,
    }),
  ]

  if (resolvedSubPackages.length > 0) {
    plugins.unshift(createUniAppSubPackageIndexEmitter(resolvedSubPackages))
  }

  return plugins.length === 1 ? plugins[0] : plugins
}
