import path from 'pathe'
import type { Plugin, ResolvedConfig } from 'vite'
import fs from 'fs-extra'
import MagicString from 'magic-string'
import { addExtension, removeExtension } from '@weapp-core/shared'
import { isCSSRequest, preprocessCSS } from 'vite'
// import chokidar from 'chokidar'
import fg from 'fast-glob'
import { defaultExcluded, supportedCssExtensions } from '../utils'
import { getEntries } from '../entry'
// import { createPluginCache } from '../cache'
import { createDebugger } from '../debugger'
import type { Context } from '../context'
import { runDev, runProd } from '../build'
// import { MiscSymbol } from '../symbols'
import type { AppEntry } from '../types'
import type { ParseRequestResponse } from './parse'
import { parseRequest } from './parse'

const debug = createDebugger('weapp-vite:plugin')

function normalizeCssPath(id: string) {
  return addExtension(removeExtension(id), '.wxss')
}

function getRealPath(res: ParseRequestResponse) {
  if (res.query.wxss) {
    return addExtension(removeExtension(res.filename), '.wxss')
  }
  return res.filename
}
// <wxs module="wxs" src="./test.wxs"></wxs>
// https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html

// https://developers.weixin.qq.com/miniprogram/dev/reference/wxml/import.html

// https://github.com/rollup/rollup/blob/c6751ff66d33bf0f4c87508765abb996f1dd5bbe/src/watch/fileWatcher.ts#L2
// https://github.com/rollup/rollup/blob/c6751ff66d33bf0f4c87508765abb996f1dd5bbe/src/watch/watch.ts#L174
export function vitePluginWeapp(ctx: Context): Plugin[] {
  function getInputOption(entries: string[]) {
    return entries
      .reduce<Record<string, string>>((acc, cur) => {
        acc[relative(cur)] = cur
        return acc
      }, {})
  }

  const stylesIds = new Set<string>()

  let configResolved: ResolvedConfig
  let entriesSet: Set<string> = new Set()
  function relative(p: string) {
    return path.relative(configResolved.root, p)
  }

  let appEntry: AppEntry
  // TODO

  // const cacheInstance = createPluginCache(Object.create(null))
  return [
    {
      name: 'weapp-vite:pre',
      enforce: 'pre',
      api: {

      },
      // config->configResolved->|watching|options->buildStart
      config(config, env) {
        debug?.(config, env)
        if (config?.weapp?.srcRoot && !config?.weapp.subPackage && !ctx.srcRootRef.value) {
          ctx.srcRootRef.value = config.weapp.srcRoot
        }
      },
      configResolved(config) {
        debug?.(config)
        // if (ctx.isDev) {
        //   set(config, 'build.watch.include', [path.join(ctx.srcRootRef.value, '**/*.{wxml,wxs}')])
        //   set(config, 'build.watch.exclude', [...defaultExcluded])
        //   // config.build?.watch?.include ||=
        // }
        configResolved = config
      },
      async options(options) {
        const { root, build, weapp } = configResolved
        const entries = await getEntries({
          root,
          outDir: build.outDir,
          srcRoot: weapp?.srcRoot,
          subPackage: weapp?.subPackage,
        })
        if (entries) {
          const paths: string[] = []
          if (entries.app) {
            paths.push(entries.app.path)
            appEntry = entries.app
          }
          paths.push(...[...entries.pages, ...entries.components].map((x) => {
            return x.path
          }))
          if (entries.subPackageEntries) {
            paths.push(...entries.subPackageEntries.map((x) => {
              return x.path
            }))
          }
          const input = getInputOption(paths)
          entriesSet = new Set(paths)
          options.input = input
          if (Array.isArray(entries.subPackages) && entries.subPackages.length) {
            for (const subPackage of entries.subPackages) {
              if (subPackage.root && !ctx.watcherCache.has(subPackage.root)) {
                if (ctx.isDev) {
                  runDev(ctx, {
                    weapp: {
                      subPackage,
                    },
                  })
                }
                else {
                  runProd(ctx, {
                    weapp: {
                      subPackage,
                    },
                  })
                }
              }
            }
          }
        }
        else {
          throw new Error(`在 ${path.join(root, weapp?.srcRoot ?? '')} 目录下没有找到 \`app.json\`, 请确保你初始化了小程序项目，或者在 \`vite.config.ts\` 中设置的正确的 \`weapp.srcRoot\` 配置路径  `)
        }
      },
      async buildStart() {
        const { root, build, weapp } = configResolved
        let cwd = root
        const ignore: string[] = [
          ...defaultExcluded,
        ]
        if (!appEntry && weapp?.subPackage && weapp.subPackage.root) {
          // subPackage
          cwd = path.join(root, weapp.subPackage.root)
        }
        else {
          ignore.push(
            ...[
              `${build.outDir}/**`,
              ...appEntry.deps.filter(
                x => x.type === 'subPackage',
              )
                .map((x) => {
                  return `${x.root}/**`
                }),
              'project.config.json',
              'project.private.config.json',
              'package.json',
              'tsconfig.json',
              'tsconfig.node.json',
            ],
          )
        }
        const files = await fg(
          // 假如去 join root 就是返回 absolute
          [path.join(weapp?.srcRoot ?? '', '**/*.{wxml,json,wxs,png,jpg,jpeg,gif,svg,webp}')],
          {
            cwd,
            ignore,
            absolute: false,
          },
        )
        for (const file of files) {
          const filepath = path.resolve(cwd, file)

          this.addWatchFile(filepath)
          this.emitFile({
            type: 'asset',
            fileName: ctx.relativeSrcRoot(file),
            source: await fs.readFile(filepath, 'utf8'),
          })
        }
        // if (!ctx.watcherCache.has(MiscSymbol)) {
        //   // ctx.watcherCache.
        //   const watcher = chokidar.watch('**/*.{wxml,json,wxs,png,jpg,jpeg,gif,svg,webp}', {
        //     ignored: [
        //       ...defaultExcluded,
        //       `${build.outDir}/**`,
        //       'project.config.json',
        //       'project.private.config.json',
        //       'package.json',
        //       'tsconfig.json',
        //       'tsconfig.node.json',
        //     ],
        //     cwd: root,
        //   })

        //   // const fileReferenceIdMap: Record<string, string> = {}

        //   watcher
        //     .on(
        //       'add',
        //       async (file) => {
        //         const filepath = path.resolve(root, file)
        //         this.addWatchFile(filepath)
        //         ctx.assetCache.set(file, {
        //           type: 'asset',
        //           fileName: path.normalize(file),
        //           source: await fs.readFile(filepath, 'utf8'),
        //         })
        //       },
        //     )
        //     .on(
        //       'change',
        //       async (file) => {
        //         const filepath = path.resolve(root, file)
        //         this.addWatchFile(filepath)
        //         ctx.assetCache.set(file, {
        //           type: 'asset',
        //           fileName: path.normalize(file),
        //           source: await fs.readFile(filepath, 'utf8'),
        //         })
        //       },
        //     )
        //     .on(
        //       'unlink',
        //       (file) => {
        //         ctx.assetCache.delete(file)
        //       },
        //     )
        //     .on('ready', () => {
        //       console.log('ready')
        //     })

        //   ctx.watcherCache.set(MiscSymbol, watcher)
        // }

        // for (const emittedFile of ctx.assetCache.values()) {
        //   this.emitFile(emittedFile)
        // }
      },
      resolveId(source) {
        if (/\.wxss$/.test(source)) {
          return source.replace(/\.wxss$/, '.css?wxss')
        }
      },
      load(id) {
        if (entriesSet.has(id)) {
          const base = removeExtension(id)
          const ms = new MagicString(fs.readFileSync(id, 'utf8'))
          for (const ext of supportedCssExtensions) {
            const mayBeCssPath = addExtension(base, ext)

            if (fs.existsSync(mayBeCssPath)) {
              this.addWatchFile(mayBeCssPath)
              ms.prepend(`import '${mayBeCssPath}'\n`)
            }
          }
          this.addWatchFile(id)
          return {
            code: ms.toString(),
          }
        }
        else if (isCSSRequest(id)) {
          stylesIds.add(id)
          return {
            code: '',
          }
        }
      },
      async buildEnd() {
        const styles: Record<string, string> = {}
        for (const stylesId of stylesIds) {
          const parsed = parseRequest(stylesId)

          const css = await fs.readFile(getRealPath(parsed), 'utf8')
          const res = await preprocessCSS(css, stylesId, configResolved)
          const fileName = relative(normalizeCssPath(stylesId))
          if (styles[fileName]) {
            styles[fileName] += res.code
          }
          else {
            styles[fileName] = res.code
          }
        }
        for (const style of Object.entries(styles)) {
          this.emitFile({
            type: 'asset',
            fileName: ctx.relativeSrcRoot(style[0]),
            source: style[1],
          })
        }
      },
      // generateBundle(_options, _bundle) {
      //   const files = this.getWatchFiles()
      //   console.log(files)
      // },
    },
    {
      name: 'weapp-vite',
    },
    {
      name: 'weapp-vite:post',
      enforce: 'post',
    },
  ]
}
