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
                const wxssContent = fs.readFileSync(wxssFilePath, 'utf8')
                return wxssContent
              }
            }
          },
          buildEnd() {
            const files = this.getWatchFiles()
            console.log(files)
          },
          // moduleParsed(info) {
          //   console.log(info)
          // },
        },
        {
          name: 'weapp-vite:css',

          // renderStart() {
          //   const ids = this.getModuleIds()
          //   console.log(ids)
          //   // for (const id of ids) {

          //   // }
          // },
          // renderChunk() {
          //   console.log('-----')
          // },
          // renderChunk(code, chunk, options, meta) {
          //   console.log(code, chunk, options, meta)
          // },
          generateBundle(_options, bundle) {
            for (const [key, value] of Object.entries(bundle)) {
              if (value.type === 'asset' && value.fileName.endsWith('.wxss')) {
                const cssPath = path.relative(cwd, key)
                value.fileName = cssPath
              }
            }
          },
        },
        {
          name: 'weapp-vite:css-post',
          enforce: 'post',

          // load(id, options) {

          // },

          // renderChunk(code, chunk, options, meta) {
          //   console.log(code, chunk, options, meta)
          // },
        },
        // Inspect({
        //   build: true,
        //   outputDir: '.vite-inspect',
        //   open: true,
        // }),
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
            assetFileNames(chunkInfo) {
              if (chunkInfo.name?.endsWith('.css')) {
                return chunkInfo.name.replace(/\.css$/, '.wxss')
              }
              else {
                return '[name][extname]'
              }
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
