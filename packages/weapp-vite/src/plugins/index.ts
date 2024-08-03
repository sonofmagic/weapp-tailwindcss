import path from 'node:path'
import type { Plugin } from 'vite'
import fs from 'fs-extra'
import { addExtension } from '@rollup/pluginutils'
import MagicString from 'magic-string'
import { removeExtension } from '@weapp-core/shared'
import fg from 'fast-glob'
import defu from 'defu'
import { addPathForCss, defaultExcluded, extractPathFromCss } from '../utils'

const supportCss = ['wxss', 'scss', 'sass', 'less', 'styl']

const supportCssExtensions = supportCss.map(x => `.${x}`)

interface VitePluginWeappOptions {
  cwd?: string
  entries?: Set<string>
  src?: string
}

export function vitePluginWeapp(options?: VitePluginWeappOptions): Plugin[] {
  const { cwd, entries, src } = defu<Required<VitePluginWeappOptions>, Partial<VitePluginWeappOptions>[]>(options, {
    src: '',
  })
  function relative(p: string) {
    return path.relative(cwd, p)
  }
  return [
    {
      name: 'weapp-vite:css-pre',
      enforce: 'pre',
      resolveId(source) {
        if (/\.wxss$/.test(source)) {
          return source.replace(/\.wxss$/, '.virtual.wxss.css')
        }
      },
      load(id) {
        if (entries.has(id)) {
          const base = removeExtension(id)
          const ms = new MagicString(fs.readFileSync(id, 'utf8'))
          for (const ext of supportCssExtensions) {
            const mayBeCssPath = addExtension(base, ext)

            if (fs.existsSync(mayBeCssPath)) {
              ms.prepend(`import '${mayBeCssPath}'\n`)
            }
          }

          return {
            code: ms.toString(),
          }
        }
        else if (id.endsWith('.virtual.wxss.css')) {
          const wxssFilePath = id.replace(/\.virtual\.wxss\.css$/, '.wxss')
          if (fs.existsSync(wxssFilePath)) {
            return {
              code: addPathForCss(wxssFilePath, fs.readFileSync(wxssFilePath, 'utf8')),
            }
          }
        }
      },
      async buildEnd() {
        const files = await fg(
          [path.join(src, '**/*.{wxml,json,png,jpg,jpeg,gif,svg,webp}')],
          {
            cwd,
            ignore: [
              ...defaultExcluded,
              path.resolve(cwd, 'dist/**'),
              'project.config.json',
              'project.private.config.json',
              'package.json',
            ],
          },
        )
        for (const file of files) {
          this.emitFile({
            type: 'asset',
            fileName: file,
            source: await fs.readFile(path.resolve(cwd, file)),
          })
        }
      },
    },
    {
      name: 'weapp-vite:css',
      generateBundle(_options, bundle) {
        for (const [_key, value] of Object.entries(bundle)) {
          if (value.type === 'asset' && value.fileName.endsWith('.css')) {
            const code = value.source.toString()
            const meta = extractPathFromCss(code)
            if (meta) {
              const cssPath = relative(meta.path)
              value.fileName = cssPath
              const ms = new MagicString(code)
              // + \n
              ms.remove(meta.start, meta.end + 1)
              value.source = ms.toString()
            }
          }
        }
      },
    },
    {
      name: 'weapp-vite:css-post',
      enforce: 'post',
    },
  ]
}
