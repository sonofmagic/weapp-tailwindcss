import path from 'node:path'
import { build } from 'vite'
import type { RollupOutput, RollupWatcher } from 'rollup'
import fs from 'fs-extra'
import { addExtension, createFilter } from '@rollup/pluginutils'
// import Inspect from 'vite-plugin-inspect'
import MagicString from 'magic-string'
import { escapeStringRegexp, removeExtension } from '@weapp-core/shared'
import fg from 'fast-glob'
import { defaultExcluded, scanEntries } from './utils'

const cssComment = {
  start: '/*',
  end: '*/',
}

export function extractPathFromCss(code: string) {
  const cssCommentStart = escapeStringRegexp(cssComment.start)
  const cssCommentEnd = escapeStringRegexp(cssComment.end)
  const reg = new RegExp(`${cssCommentStart}#weapp-vite:css-start\\{(.*?)\\}weapp-vite:css-end#${cssCommentEnd}`)
  const arr = code.match(reg)
  if (arr) {
    return {
      path: arr[1],
      start: arr.index ?? 0,
      end: (arr.index ?? 0) + arr[0].length,
    }
  }
}

export function addPathForCss(filepath: string, code: string) {
  return `${cssComment.start}#weapp-vite:css-start{${filepath}}weapp-vite:css-end#${cssComment.end}\n${code}`
}

const supportCss = ['wxss', 'scss', 'sass', 'less', 'styl']

const supportCssExtensions = supportCss.map(x => `.${x}`)

export async function runDev(cwd: string) {
  const filter = createFilter([], [...defaultExcluded, path.resolve(cwd, 'dist/**')])
  const entries = await scanEntries(cwd, { filter })

  function relative(p: string) {
    return path.relative(cwd, p)
  }

  if (entries) {
    const allEntries = [entries.app, ...entries.pages, ...entries.components]
    const allSet = new Set<string>(allEntries)
    const input = allEntries
      .reduce<Record<string, string>>((acc, cur) => {
        acc[relative(cur)] = cur
        return acc
      }, {})

    const watcher = (await build({
      plugins: [
        {
          name: 'weapp-vite:css-pre',
          enforce: 'pre',
          resolveId(source) {
            if (/\.wxss$/.test(source)) {
              return source.replace(/\.wxss$/, '.virtual.wxss.css')
            }
          },
          load(id) {
            if (allSet.has(id)) {
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
              ['**/*.{wxml,json,png,jpg,jpeg,gif,svg,webp}'],
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
      ],
      build: {
        watch: {
          chokidar: {
            persistent: true,
          },
        },
        assetsDir: '.',
        rollupOptions: {
          input,
          output: {
            format: 'cjs',
            entryFileNames: (chunkInfo) => {
              return chunkInfo.name
            },
          },
        },
        minify: false,
        commonjsOptions: {
          transformMixedEsModules: true,
        },

      },
    })) as RollupWatcher

    return watcher
  }
}

export async function runProd(_cwd: string) {
  const output = (await build({
    build: {

    },
  })) as RollupOutput | RollupOutput[]

  return output
}
