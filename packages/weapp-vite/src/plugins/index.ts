import path from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'
import fs from 'fs-extra'
import MagicString from 'magic-string'
import { addExtension, defu, removeExtension } from '@weapp-core/shared'
import fg from 'fast-glob'
import { isCSSRequest, preprocessCSS } from 'vite'
import { defaultExcluded, supportedCssExtensions } from '../utils'

export interface ParseRequestResponse {
  filename: string
  query: { wxss?: true }
}

// const virtualModuleId = 'virtual:weapp-vite-pages'
// const resolvedVirtualModuleId = '\0' + virtualModuleId

export function parseRequest(id: string): ParseRequestResponse {
  const [filename, rawQuery] = id.split(`?`, 2)
  const query = Object.fromEntries(new URLSearchParams(rawQuery)) as { wxss?: true }
  if (query.wxss !== null) {
    query.wxss = true
  }
  return {
    filename,
    query,
  }
}
export interface VitePluginWeappOptions {
  cwd?: string
  entries?: string[]
  src?: string
}

function normalizeCssPath(id: string) {
  return addExtension(removeExtension(id), '.wxss')
}

function getRealPath(res: ParseRequestResponse) {
  if (res.query.wxss) {
    return addExtension(removeExtension(res.filename), '.wxss')
  }
  return res.filename
}

export function vitePluginWeapp(options?: VitePluginWeappOptions): Plugin[] {
  const { cwd, entries: _entries, src } = defu<Required<VitePluginWeappOptions>, Partial<VitePluginWeappOptions>[]>(options, {
    src: '',
  })
  function relative(p: string) {
    return path.relative(cwd, p)
  }

  const input = _entries
    .reduce<Record<string, string>>((acc, cur) => {
      acc[relative(cur)] = cur
      return acc
    }, {})
  const entries = Array.isArray(_entries) ? new Set(_entries) : _entries

  const stylesIds = new Set<string>()

  let configResolved: ResolvedConfig

  return [
    {
      name: 'weapp-vite:pre',
      enforce: 'pre',
      // config->configResolved->|watching|options->buildStart
      // config(config, env) {
      //   // console.log('config', config, env)
      // },
      options(options) {
        // console.log('options', options)
        options.input = input
      },
      configResolved(config) {
        // console.log('configResolved', config)
        // config.build.rollupOptions.input = input
        configResolved = config
      },
      // buildStart() {
      //   console.log('buildStart')
      // },
      resolveId(source) {
        if (/\.wxss$/.test(source)) {
          return source.replace(/\.wxss$/, '.css?wxss')
        }
      },
      load(id) {
        if (entries.has(id)) {
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
            fileName: style[0],
            source: style[1],
          })
        }
        const files = await fg(
          [path.join(src, '**/*.{wxml,json,png,jpg,jpeg,gif,svg,webp}')],
          {
            cwd,
            ignore: [
              ...defaultExcluded,
              'dist/**',
              'project.config.json',
              'project.private.config.json',
              'package.json',
            ],
          },
        )
        for (const file of files) {
          const filepath = path.resolve(cwd, file)
          this.addWatchFile(filepath)
          this.emitFile({
            type: 'asset',
            fileName: file,
            source: await fs.readFile(filepath),
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
