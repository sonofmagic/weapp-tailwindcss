import path from 'pathe'
import { build } from 'vite'
import type { RollupOutput } from 'rollup'

import { runProd } from '@/build'
import { getEntries } from '@/entry'

describe('build', () => {
  describe('rollup', () => {
    const mixjsDir = path.resolve(__dirname, './fixtures/mixjs')
    // function r(...args: string[]) {
    //   return path.resolve(mixjsDir, ...args)
    // }

    it('mixjs getEntries', async () => {
      const entries = await getEntries({
        cwd: mixjsDir,
        relative: true,
      })
      expect(entries).toMatchSnapshot()
    })

    it('mixjs vite build', async () => {
      function relative(p: string) {
        return path.relative(mixjsDir, p)
      }
      const entries = await getEntries({
        cwd: mixjsDir,
      })
      if (!entries) {
        return
      }
      const input = entries.all
        .reduce<Record<string, string>>((acc, cur) => {
          acc[relative(cur)] = cur
          return acc
        }, {})

      const res = await build({
        build: {
          rollupOptions: {
            input,
            output: {
              format: 'cjs',
              entryFileNames: (chunkInfo) => {
                return chunkInfo.name
              },
            },
          },
          assetsDir: '.',
          write: false,
          commonjsOptions: {
            include: undefined,
            transformMixedEsModules: true,
          },
          minify: false,
        },
        // plugins: [
        //   {
        //     name: 'inspect',
        //     enforce: 'pre',
        //     configResolved(_config) {
        //       // console.log(config)
        //     },
        //     resolveId(source) {
        //       console.log('resolveId', source)
        //     },
        //     load(id, options) {
        //       console.log('load', id, options)
        //     },
        //     generateBundle(_options, _bundle) {
        //       console.log('generateBundle', _bundle)
        //     },
        //   },
        // ],

      }) as RollupOutput

      for (const item of res.output) {
        // @ts-ignore
        expect(item.code).toMatchSnapshot(path.normalize(item.fileName))
      }
    })

    it('mixjs runProd', async () => {
      const res = await runProd(mixjsDir, {
        build: {
          minify: false,
          commonjsOptions: {
            include: undefined,
            transformMixedEsModules: true,
          },
        },

        plugins: [
          {
            name: 'inspect',
            enforce: 'pre',
            configResolved(_config) {
              // console.log(config)
            },
            resolveId(source) {
              console.log('resolveId', source)
            },
            load(id, options) {
              console.log('load', id, options)
            },
            generateBundle(_options, _bundle) {
              console.log('generateBundle', _bundle)
            },
            buildEnd(error) {
              console.log(error)
            },
          },
        ],
      }) as RollupOutput

      for (const item of res.output) {
        // @ts-ignore
        expect(item.code).toMatchSnapshot(path.normalize(item.fileName))
      }
    })
  })
})
