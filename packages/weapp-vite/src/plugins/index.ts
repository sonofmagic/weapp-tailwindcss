import path from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'
import fs from 'fs-extra'
import MagicString from 'magic-string'
import { addExtension, removeExtension } from '@weapp-core/shared'
import fg from 'fast-glob'
import { isCSSRequest, preprocessCSS } from 'vite'
import { defaultExcluded, supportedCssExtensions } from '../utils'
import { getEntries } from '../entry'
// import { createPluginCache } from '../cache'
import { createDebugger } from '../debugger'
import type { Context } from '../context'
import { runDev, runProd } from '../build'
import type { ParseRequestResponse } from './parse'
import { parseRequest } from './parse'

const debug = createDebugger('weapp-vite:plugin')
// export interface VitePluginWeappOptions {
//   srcRoot?: string
// }

function normalizeCssPath(id: string) {
  return addExtension(removeExtension(id), '.wxss')
}

function getRealPath(res: ParseRequestResponse) {
  if (res.query.wxss) {
    return addExtension(removeExtension(res.filename), '.wxss')
  }
  return res.filename
}

export function vitePluginWeapp(ctx: Context): Plugin[] {
  // options?: VitePluginWeappOptions
  // const { srcRoot } = defu<Required<VitePluginWeappOptions>, Partial<VitePluginWeappOptions>[]>(options, {
  //   srcRoot: '',
  // })

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
  // TODO

  // const cacheInstance = createPluginCache(Object.create(null))
  return [
    {
      name: 'weapp-vite:pre',
      enforce: 'pre',
      // config->configResolved->|watching|options->buildStart
      config(config, env) {
        debug?.(config, env)
      },
      configResolved(config) {
        debug?.(config)
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
        const { root, build } = configResolved
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
            fileName: style[0],
            source: style[1],
          })
        }
        const files = await fg(
          // 假如去 join root 就是返回 absolute
          ['**/*.{wxml,json,wxs,png,jpg,jpeg,gif,svg,webp}'],
          {
            cwd: root,
            ignore: [
              ...defaultExcluded,
              `${build.outDir}/**`,
              'project.config.json',
              'project.private.config.json',
              'package.json',
              'tsconfig.json',
              'tsconfig.node.json',
            ],
            absolute: false,
          },
        )
        for (const file of files) {
          const filepath = path.resolve(root, file)

          this.addWatchFile(filepath)
          this.emitFile({
            type: 'asset',
            fileName: path.normalize(file),
            source: await fs.readFile(filepath, 'utf8'),
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
