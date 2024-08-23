import process from 'node:process'
import path from 'pathe'
import { type InlineConfig, build, loadConfigFromFile } from 'vite'
import defu from 'defu'
import type { RollupOutput, RollupWatcher } from 'rollup'
import type { FSWatcher } from 'chokidar'
import { watch } from 'chokidar'
import type { PackageJson } from 'pkg-types'
import { readPackageJSON } from 'pkg-types'
import { addExtension, removeExtension } from '@weapp-core/shared'
import tsconfigPaths from 'vite-tsconfig-paths'
import { type ProjectConfig, getProjectConfig } from './utils/projectConfig'
import { RootRollupSymbol } from './symbols'
import type { SubPackage, WatchOptions } from './types'
import { getWeappWatchOptions } from './defaults'
import { vitePluginWeapp } from './plugins'
// import { getProjectConfig } from './utils/projectConfig'

export interface CompilerContextOptions {
  cwd: string
  inlineConfig?: InlineConfig
  isDev?: boolean
  projectConfig?: ProjectConfig
  type?: 'app' | 'subPackage'
  mode?: string
  packageJson?: PackageJson
  subPackage?: SubPackage
}
export class CompilerContext {
  inlineConfig: InlineConfig
  cwd: string
  isDev: boolean
  projectConfig: ProjectConfig
  mode: string
  packageJson: PackageJson
  subPackage?: SubPackage
  watcherMap: Map<string | symbol, RollupWatcher | FSWatcher>
  subPackageContextMap: Map<string, CompilerContext>
  constructor(options?: CompilerContextOptions) {
    const { cwd, isDev, inlineConfig, projectConfig, mode, packageJson, subPackage } = defu<Required<CompilerContextOptions>, CompilerContextOptions[]>(options, {
      cwd: process.cwd(),
      isDev: false,
      projectConfig: {},
      type: 'app',
      inlineConfig: {},
      mode: '',
      packageJson: {},

    })
    this.cwd = cwd
    this.inlineConfig = inlineConfig
    this.isDev = isDev
    this.projectConfig = projectConfig
    this.mode = mode
    this.packageJson = packageJson
    this.subPackage = subPackage
    this.watcherMap = new Map()
    this.subPackageContextMap = new Map()
  }

  get srcRoot() {
    return this.inlineConfig?.weapp?.srcRoot
  }

  relativeSrcRoot(p: string) {
    if (this.srcRoot) {
      return path.relative(this.srcRoot, p)
    }
    return p
  }

  get mpDistRoot(): string {
    return this.projectConfig.miniprogramRoot || this.projectConfig.srcMiniprogramRoot || ''
  }

  get weappConfig() {
    return this.inlineConfig.weapp
  }

  get inlineSubPackageConfig() {
    return this.weappConfig?.subPackage
  }

  forkSubPackage(subPackage: SubPackage): CompilerContext {
    const ctx = new CompilerContext({
      cwd: this.cwd,
      isDev: this.isDev,
      projectConfig: this.projectConfig,
      inlineConfig: this.inlineConfig,
      type: 'subPackage',
      mode: this.mode,
      subPackage,
    })
    this.subPackageContextMap.set(subPackage.root, ctx)
    return ctx
  }

  async internalDev(inlineConfig: InlineConfig) {
    const rollupWatcher = (await build(
      inlineConfig,
    )) as RollupWatcher
    const key = this.subPackage?.root || RootRollupSymbol

    const watcher = this.watcherMap.get(key)
    watcher?.close()
    this.watcherMap.set(key, rollupWatcher)

    return rollupWatcher
  }

  async runDev() {
    if (process.env.NODE_ENV === undefined) {
      process.env.NODE_ENV = 'development'
    }

    const inlineConfig = defu<InlineConfig, InlineConfig[]>(
      this.inlineConfig,
      {
        mode: 'development',
        build: {
          watch: {},
          minify: false,
          emptyOutDir: false,
        },
      },
    )

    // 小程序分包的情况，再此创建一个 watcher
    if (inlineConfig?.weapp?.subPackage) {
      return await this.internalDev(inlineConfig)
    }
    else {
      const { paths, ...opts } = defu<Required<WatchOptions>, WatchOptions[]>(inlineConfig.weapp?.watch, {
        ignored: [
          path.join(this.mpDistRoot, '**'),
        ],
        cwd: this.cwd,
      }, getWeappWatchOptions())
      const watcher = watch(paths, opts)
      let isReady = false
      watcher.on('all', async (eventName) => {
        if (isReady && (eventName === 'add' || eventName === 'change' || eventName === 'unlink')) {
          await this.internalDev(inlineConfig)
        }
      }).on('ready', async () => {
        await this.internalDev(inlineConfig)
        isReady = true
      })

      return watcher
    }
  }

  async runProd() {
    const inlineConfig = defu<InlineConfig, InlineConfig[]>(
      this.inlineConfig,
      {
        mode: 'production',
      },
    )
    const output = (await build(
      inlineConfig,
    )) as RollupOutput | RollupOutput[]

    return output
  }

  build() {
    if (this.isDev) {
      return this.runDev()
    }
    else {
      return this.runProd()
    }
  }

  async loadDefaultConfig() {
    const projectConfig = getProjectConfig(this.cwd)
    this.projectConfig = projectConfig
    const localPackageJson = await readPackageJSON(path.resolve(this.cwd, 'package.json'))
    this.packageJson = localPackageJson
    const external: string[] = []
    const loaded = await loadConfigFromFile({
      command: this.isDev ? 'serve' : 'build',
      mode: this.mode,
    }, undefined, this.cwd)

    if (localPackageJson.dependencies) {
      external.push(...Object.keys(localPackageJson.dependencies))
    }

    this.inlineConfig = defu<InlineConfig, (InlineConfig | undefined)[]>({
      mode: this.mode,
      build: {
        rollupOptions: {
          output: {
            format: 'cjs',
            strict: false,
            entryFileNames: (chunkInfo) => {
              const name = this.relativeSrcRoot(chunkInfo.name)
              if (name.endsWith('.ts')) {
                const baseFileName = removeExtension(name)
                if (baseFileName.endsWith('.wxs')) {
                  return path.normalize((baseFileName))
                }
                return path.normalize(addExtension(baseFileName, '.js'))
              }
              return path.normalize(name)
            },
          },
          external,
        },
        assetsDir: '.',
        commonjsOptions: {
          transformMixedEsModules: true,
          include: undefined,
        },
      },
      plugins: [
        vitePluginWeapp(this),
        tsconfigPaths(),
      ],
      configFile: false,
    }, loaded?.config, this.inlineConfig)
  }
}
