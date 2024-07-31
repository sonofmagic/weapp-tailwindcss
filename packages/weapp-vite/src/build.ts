import path from 'node:path'
import { build } from 'vite'
import type { RollupOutput, RollupWatcher } from 'rollup'
import fs from 'fs-extra'
import { addExtension } from '@rollup/pluginutils'
// import Inspect from 'vite-plugin-inspect'
import { scanEntries } from './utils'

export function removeExt(file: string) {
  return file.replace(/\.[^./]+$/, '')
}

export function getPathFromCss(code: string) {
  const arr = code.match(/\/\*#weapp-vite:css-start\{(.*?)\}weapp-vite:css-end#\*\//)
  if (arr) {
    return arr[1]
  }
}

export async function runDev(cwd: string) {
  const entries = await scanEntries(cwd)

  if (entries) {
    const allEntries = [entries.app, ...entries.pages, ...entries.components]
    const allSet = new Set<string>(allEntries)
    const input = allEntries
      .reduce<Record<string, string>>((acc, cur) => {
        acc[path.relative(cwd, cur)] = cur
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
              const mayBeCssPath = addExtension(removeExt(id), '.wxss')
              if (fs.existsSync(mayBeCssPath)) {
                // path.relative(cwd, mayBeCssPath)
                return {
                  code: `import '${mayBeCssPath}'\n${fs.readFileSync(id, 'utf8')}`,
                }
              }
            }
            else if (id.endsWith('.virtual.wxss.css')) {
              const wxssFilePath = id.replace(/\.virtual\.wxss\.css$/, '.wxss')
              if (fs.existsSync(wxssFilePath)) {
                const wxssContent = `/*#weapp-vite:css-start{${wxssFilePath}}weapp-vite:css-end#*/\n${fs.readFileSync(wxssFilePath, 'utf8')}`
                return wxssContent
              }
            }
          },
        },
        {
          name: 'weapp-vite:css',
          generateBundle(_options, bundle) {
            for (const [_key, value] of Object.entries(bundle)) {
              if (value.type === 'asset' && value.fileName.endsWith('.css')) {
                const p = getPathFromCss(value.source.toString())
                if (p) {
                  const cssPath = path.relative(cwd, p)
                  value.fileName = cssPath
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
            // chunkFileNames: '[name].js',
          },
        },
        minify: false,
        commonjsOptions: {
          // include:[]
        },

      },
    })) as RollupWatcher

    return watcher
  }
}

export async function runProd(_cwd: string) {
  // const entries = await scanEntries(cwd)
  const output = (await build({
    build: {

    },
  })) as RollupOutput | RollupOutput[]

  return output
}
