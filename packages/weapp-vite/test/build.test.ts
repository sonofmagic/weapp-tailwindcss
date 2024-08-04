import path from 'pathe'
import { build } from 'vite'
import type { RollupOutput } from 'rollup'
import { addPathForCss, extractPathFromCss } from './utils'
import { getEntries, runProd } from '@/build'

describe('build', () => {
  describe('extractPathFromCss', () => {
    it('should correctly extract the path from a CSS comment', () => {
      const raw = 'body { color: black; }'
      let code = addPathForCss('/path/to/file.css', raw)
      let result = extractPathFromCss(code)
      expect(result).toEqual({
        path: '/path/to/file.css',
        start: 0,
        end: 63,
      })
      code = `xx\n${code}`
      result = extractPathFromCss(code)
      expect(result).toEqual({
        path: '/path/to/file.css',
        start: 3,
        end: 66,
      })
    })

    it('should return undefined when the CSS comment is not present', () => {
      const code = 'body { color: black; }'
      const result = extractPathFromCss(code)
      expect(result).toBeUndefined()
    })

    it('should handle an empty path correctly', () => {
      const code = '/*#weapp-vite:css-start{}weapp-vite:css-end#*/\nbody { color: black; }'
      const result = extractPathFromCss(code)
      expect(result).toEqual({
        path: '',
        start: 0,
        end: 46,
      })
    })

    it('should handle multiple matches by returning the first match', () => {
      const code = '/*#weapp-vite:css-start{/first/path.css}weapp-vite:css-end#*/\n/*#weapp-vite:css-start{/second/path.css}weapp-vite:css-end#*/\nbody { color: black; }'
      const result = extractPathFromCss(code)
      expect(result).toEqual({
        path: '/first/path.css',
        start: 0,
        end: 61,
      })
    })

    it('should handle paths with special characters', () => {
      const code = '/*#weapp-vite:css-start{/path/with special_chars.css}weapp-vite:css-end#*/\nbody { color: black; }'
      const result = extractPathFromCss(code)
      expect(result).toEqual({
        path: '/path/with special_chars.css',
        start: 0,
        end: 74,
      })
    })
  })

  describe('addPathForCss', () => {
    it('should correctly add a path comment to the CSS code', () => {
      const filepath = '/path/to/file.css'
      const code = 'body { color: black; }'
      const result = addPathForCss(filepath, code)
      expect(result).toBe('/*#weapp-vite:css-start{/path/to/file.css}weapp-vite:css-end#*/\nbody { color: black; }')
    })

    it('should handle an empty CSS code', () => {
      const filepath = '/path/to/file.css'
      const code = ''
      const result = addPathForCss(filepath, code)
      expect(result).toBe('/*#weapp-vite:css-start{/path/to/file.css}weapp-vite:css-end#*/\n')
    })

    it('should handle an empty filepath', () => {
      const filepath = ''
      const code = 'body { color: black; }'
      const result = addPathForCss(filepath, code)
      expect(result).toBe('/*#weapp-vite:css-start{}weapp-vite:css-end#*/\nbody { color: black; }')
    })

    it('should handle filepaths with special characters', () => {
      const filepath = '/path/with special_chars.css'
      const code = 'body { color: black; }'
      const result = addPathForCss(filepath, code)
      expect(result).toBe('/*#weapp-vite:css-start{/path/with special_chars.css}weapp-vite:css-end#*/\nbody { color: black; }')
    })

    it('should handle very long file paths', () => {
      const filepath = `${'/'.repeat(1000)}file.css`
      const code = 'body { color: black; }'
      const result = addPathForCss(filepath, code)
      expect(result).toBe(`/*#weapp-vite:css-start{${filepath}}weapp-vite:css-end#*/\nbody { color: black; }`)
    })
  })

  describe('cSS Path Manipulation', () => {
    it('should add a path comment and then correctly extract it', () => {
      const filepath = '/path/to/file.css'
      const cssCode = 'body { color: black; }'

      // Add the path using addPathForCss
      const modifiedCode = addPathForCss(filepath, cssCode)

      // Extract the path using extractPathFromCss
      const result = extractPathFromCss(modifiedCode)

      expect(result).toEqual({
        path: '/path/to/file.css',
        start: 0,
        end: modifiedCode.indexOf(cssCode) - 1, // Calculate end index dynamically
      })
    })

    it('should handle adding and extracting an empty path', () => {
      const filepath = ''
      const cssCode = 'body { color: black; }'

      // Add an empty path
      const modifiedCode = addPathForCss(filepath, cssCode)

      // Extract the empty path
      const result = extractPathFromCss(modifiedCode)

      expect(result).toEqual({
        path: '',
        start: 0,
        end: modifiedCode.indexOf(cssCode) - 1,
      })
    })

    it('should correctly handle paths with special characters', () => {
      const filepath = '/path/with special_chars.css'
      const cssCode = 'body { color: black; }'

      // Add a path with special characters
      const modifiedCode = addPathForCss(filepath, cssCode)

      // Extract the path
      const result = extractPathFromCss(modifiedCode)

      expect(result).toEqual({
        path: '/path/with special_chars.css',
        start: 0,
        end: modifiedCode.indexOf(cssCode) - 1,
      })
    })

    it('should handle adding a path to an empty CSS code', () => {
      const filepath = '/path/to/file.css'
      const cssCode = ''

      // Add a path to empty CSS
      const modifiedCode = addPathForCss(filepath, cssCode)

      // Extract the path
      const result = extractPathFromCss(modifiedCode)

      expect(result).toEqual({
        path: '/path/to/file.css',
        start: 0,
        end: modifiedCode.length - 1,
      })
    })

    it('should correctly handle a very long path', () => {
      const filepath = `${'/'.repeat(1000)}file.css`
      const cssCode = 'body { color: black; }'

      // Add a very long path
      const modifiedCode = addPathForCss(filepath, cssCode)

      // Extract the path
      const result = extractPathFromCss(modifiedCode)

      expect(result).toEqual({
        path: filepath,
        start: 0,
        end: modifiedCode.indexOf(cssCode) - 1,
      })
    })
  })

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
          },
        ],

      }) as RollupOutput

      for (const item of res.output) {
        // @ts-ignore
        expect(item.code).toMatchSnapshot(item.fileName)
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
        expect(item.code).toMatchSnapshot(item.fileName)
      }
    })
  })
})
