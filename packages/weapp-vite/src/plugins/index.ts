import type { Plugin, ResolvedConfig } from 'vite'
import type { CompilerContext } from '../context'
import type { AppEntry, SubPackageDep } from '../types'
import type { ParseRequestResponse } from './parse'
import { addExtension, removeExtension } from '@weapp-core/shared'
import fg from 'fast-glob'
import fs from 'fs-extra'
import MagicString from 'magic-string'
import path from 'pathe'
import { isCSSRequest, preprocessCSS } from 'vite'
import { createDebugger } from '../debugger'
import { defaultExcluded } from '../defaults'
import { getEntries } from '../entry'
import { supportedCssExtensions } from '../utils'
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
export function vitePluginWeapp(ctx: CompilerContext): Plugin[] {
  const stylesIds = new Set<string>()
  // const templateIds = new Set<string>()
  // const templateCacheMap = new Map<string, {
  //   source: string
  //   deps: WxmlDep[]
  // }>()

  let configResolved: ResolvedConfig
  let entriesSet: Set<string> = new Set()
  function relative(p: string) {
    return path.relative(configResolved.root, p)
  }
  function getInputOption(entries: string[]) {
    return entries
      .reduce<Record<string, string>>((acc, cur) => {
        acc[relative(cur)] = cur
        return acc
      }, {})
  }

  let appEntry: AppEntry | undefined
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
          if (weapp?.type === 'app' && Array.isArray(entries.subPackages) && entries.subPackages.length) {
            for (const subPackage of entries.subPackages) {
              //
              if (subPackage.root && !ctx.subPackageContextMap.has(subPackage.root)) {
                ctx.forkSubPackage(subPackage).build()
              }
            }
          }
        }
        else {
          throw new Error(`在 ${path.join(root, ctx.srcRoot ?? '')} 目录下没有找到 \`app.json\`, 请确保你初始化了小程序项目，或者在 \`vite.config.ts\` 中设置的正确的 \`weapp.srcRoot\` 配置路径  `)
        }
      },
      async buildStart() {
        const { root, build, weapp } = configResolved
        let cwd = root
        const ignore: string[] = [
          ...defaultExcluded,
        ]
        const isSubPackage = weapp?.type === 'subPackage' // Boolean(!appEntry && ctx.subPackage && ctx.subPackage.root)
        if (isSubPackage) {
          // subPackage
          cwd = path.join(root, ctx.subPackage!.root)
        }
        else {
          const ignoreSubPackage = appEntry
            ? appEntry.deps.filter(
              x => x.type === 'subPackage',
            ).map((x) => {
              return `${(x as SubPackageDep).root}/**`
            })
            : []
          ignore.push(
            ...[
              `${build.outDir}/**`,
              ...ignoreSubPackage,
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
          [path.join(ctx.srcRoot ?? '', '**/*.{wxml,json,wxs,png,jpg,jpeg,gif,svg,webp}')],
          {
            cwd,
            ignore,
            absolute: false,
          },
        )
        const relFiles = files.map((x) => {
          return isSubPackage ? path.join(weapp?.subPackage?.root ?? '', x) : x
        })
        for (const file of relFiles) {
          const filepath = path.resolve(ctx.cwd, file)

          this.addWatchFile(filepath)
          const isMedia = !/\.(?:wxml|json|wxs)$/.test(file)
          this.emitFile({
            type: 'asset',
            fileName: ctx.relativeSrcRoot(file),
            source: isMedia ? await fs.readFile(filepath) : await fs.readFile(filepath, 'utf8'),
          })
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
          // const mayBeWxmlPath = addExtension(base, '.wxml')
          // if (fs.existsSync(mayBeWxmlPath)) {
          //   this.addWatchFile(mayBeWxmlPath)
          //   ms.prepend(`import '${mayBeWxmlPath}'\n`)

          //   // const source = fs.readFileSync(mayBeWxmlPath, 'utf8')
          //   // const { deps } = getDeps(source)
          //   // templateCacheMap.set(id, {
          //   //   deps,
          //   //   source,
          //   // })
          //   // deps.filter(x => x.tagName === 'import' || x.tagName === 'include').map(x => x.name === 'src')
          // }
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
        // else if (id.endsWith('.wxml')) {
        //   return {
        //     code: '',
        //   }
        // }
      },
      async buildEnd() {
        const styles: Record<string, string> = {}
        for (const stylesId of stylesIds) {
          const parsed = parseRequest(stylesId)
          const realPath = getRealPath(parsed)
          if (await fs.exists(realPath)) {
            const css = await fs.readFile(realPath, 'utf8')
            const res = await preprocessCSS(css, stylesId, configResolved)
            const fileName = relative(normalizeCssPath(stylesId))
            if (styles[fileName]) {
              styles[fileName] += res.code
            }
            else {
              styles[fileName] = res.code
            }
          }
          else {
            stylesIds.delete(stylesId)
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
