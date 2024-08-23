import process from 'node:process'
import path from 'pathe'
import { type InlineConfig, build, loadConfigFromFile } from 'vite'
import type { RollupOutput, RollupWatcher } from 'rollup'
import type { FSWatcher } from 'chokidar'
import { watch } from 'chokidar'
import type { PackageJson } from 'pkg-types'
import { addExtension, defu, removeExtension } from '@weapp-core/shared'
import tsconfigPaths from 'vite-tsconfig-paths'
import fs from 'fs-extra'
import { type ProjectConfig, getProjectConfig } from './utils/projectConfig'
import { RootRollupSymbol } from './symbols'
import type { SubPackage, WatchOptions } from './types'
import { getWeappWatchOptions } from './defaults'
import { vitePluginWeapp } from './plugins'
import './config'
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
  type: CompilerContextOptions['type']
  parent?: CompilerContext
  constructor(options?: CompilerContextOptions) {
    const { cwd, isDev, inlineConfig, projectConfig, mode, packageJson, subPackage, type } = defu<Required<CompilerContextOptions>, CompilerContextOptions[]>(options, {
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
    this.type = type
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

  // get weappConfig() {
  //   return this.inlineConfig.weapp
  // }

  // get inlineSubPackageConfig() {
  //   return this.weappConfig?.subPackage
  // }

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
    ctx.parent = this
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
        root: this.cwd,
        mode: 'development',
        plugins: [vitePluginWeapp(this)],
        build: {
          watch: {},
          minify: false,
          emptyOutDir: false,
        },
        weapp: {
          type: 'app',
        },
      },
    )

    // 小程序分包的情况，再此创建一个 watcher
    if (this.type === 'subPackage' && this.subPackage) {
      return await this.internalDev(Object.assign({}, inlineConfig, {
        weapp: {
          srcRoot: this.parent?.srcRoot,
          type: this.type,
          subPackage: this.subPackage,
        },
      }))
    }
    else if (this.type === 'app') {
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
        root: this.cwd,
        plugins: [vitePluginWeapp(this)],
        mode: 'production',
        weapp: {
          type: 'app',
        },
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
    const packageJsonPath = path.resolve(this.cwd, 'package.json')
    const external: string[] = []
    if (await fs.exists(packageJsonPath)) {
      const localPackageJson: PackageJson = await fs.readJson(packageJsonPath, {
        throws: false,
      }) || {}
      this.packageJson = localPackageJson
      if (localPackageJson.dependencies) {
        external.push(...Object.keys(localPackageJson.dependencies))
      }
    }

    const loaded = await loadConfigFromFile({
      command: this.isDev ? 'serve' : 'build',
      mode: this.mode,
    }, undefined, this.cwd)

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
        tsconfigPaths(),
      ],
      configFile: false,
    }, loaded?.config, this.inlineConfig)
  }
}
