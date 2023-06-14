import path from 'node:path'
import fs from 'node:fs/promises'
import type { Compiler, Configuration } from 'webpack'
import postcss from 'postcss'
import { getMemfsCompiler5 as getCompiler5, compile, readAssets, createLoader, getErrors, getWarnings } from './helpers'
import { UnifiedWebpackPluginV5 } from '@/index'

function createCompiler(params: Pick<Configuration, 'mode' | 'entry'> & { tailwindcssConfig: string }) {
  const { entry, mode, tailwindcssConfig } = params

  const processor = postcss([
    // require('autoprefixer')(),
    require('tailwindcss')({ config: tailwindcssConfig })
    // require('postcss-rem-to-responsive-pixel')({
    //   rootValue: 32,
    //   propList: ['*'],
    //   transformUnit: 'rpx'
    // })
  ])

  return getCompiler5({
    mode,
    entry,
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: '[name].js', // ?var=[fullhash]
      chunkFilename: '[id].[name].js' // ?ver=[fullhash]
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          // https://webpack.js.org/configuration/module/#useentry
          use: createLoader(async function (source) {
            const basename = path.basename(this.resourcePath, path.extname(this.resourcePath))
            const filename = basename + '.wxml'
            const content = await fs.readFile(path.resolve(this.context, filename), {
              encoding: 'utf8'
            })
            this.emitFile(filename, content)

            const cssFilename = basename + '.css'

            const cssContent = await fs.readFile(path.resolve(this.context, cssFilename), {
              encoding: 'utf8'
            })

            const res = await processor.process(cssContent, {
              from: undefined,
              map: false
            })
            this.emitFile(cssFilename, res.toString())
            return source
            // this.emitFile('hello.xx', '12345')
            // console.log()
          })
        }
      ]
    }
  })
}
describe('webpack5 plugin', () => {
  let compiler: Compiler
  let prodCompiler: Compiler
  let emptyCompiler: Compiler
  beforeEach(() => {
    compiler = createCompiler({
      mode: 'development',
      entry: {
        wxml: path.resolve(__dirname, './fixtures/webpack/v5/wxml/pages/index.js')
      },
      tailwindcssConfig: path.resolve(__dirname, './fixtures/webpack/v5/wxml/tailwind.config.js')
    })

    prodCompiler = createCompiler({
      mode: 'production',
      entry: {
        wxml: path.resolve(__dirname, './fixtures/webpack/v5/wxml/pages/index.js')
      },
      tailwindcssConfig: path.resolve(__dirname, './fixtures/webpack/v5/wxml/tailwind.config.js')
    })

    emptyCompiler = createCompiler({
      mode: 'production',
      entry: {
        wxml: path.resolve(__dirname, './fixtures/webpack/v5/empty/index.js')
      },
      tailwindcssConfig: path.resolve(__dirname, './fixtures/webpack/v5/empty/tailwind.config.js')
    })
  })
  it('common', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      customReplaceDictionary: 'complex'
    }).apply(compiler)

    const stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('empty build', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      }
    }).apply(emptyCompiler)

    const stats = await compile(emptyCompiler)

    expect(readAssets(emptyCompiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('unified common', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      }
    }).apply(compiler)

    const stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('unified prod common', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      }
    }).apply(prodCompiler)

    const stats = await compile(prodCompiler)

    expect(readAssets(prodCompiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('disabled true', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      disabled: true
    }).apply(compiler)

    const stats = await compile(compiler)

    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('mangle true', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },

      customReplaceDictionary: 'complex',
      mangle: true
    }).apply(compiler)

    const stats = await compile(compiler)
    // const { runtimeSet, classGenerator } = useStore()
    // expect(runtimeSet.size).toBeGreaterThan(0)

    // expect(classGenerator.newClassSize).toBeGreaterThan(0)
    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('mangle options', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      mangle: {
        classGenerator: {
          classPrefix: ''
        }
      },
      customReplaceDictionary: 'complex'
    }).apply(compiler)

    const stats = await compile(compiler)
    // const { runtimeSet, classGenerator } = useStore()
    // expect(runtimeSet.size).toBeGreaterThan(0)

    // expect(classGenerator.newClassSize).toBeGreaterThan(0)
    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('mangle options with default mangleClassFilter', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      mangle: {
        classGenerator: {
          classPrefix: 'ice-'
        }
      }
    }).apply(compiler)

    const stats = await compile(compiler)
    // const { runtimeSet, classGenerator } = useStore()
    // expect(runtimeSet.size).toBeGreaterThan(0)

    // expect(classGenerator.newClassSize).toBeGreaterThan(0)
    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })

  it('mangle options mangleClassFilter all true', async () => {
    new UnifiedWebpackPluginV5({
      mainCssChunkMatcher(name) {
        return path.basename(name) === 'index.css'
      },
      mangle: {
        classGenerator: {
          classPrefix: 'som-'
        },
        mangleClassFilter: () => true
      }
    }).apply(compiler)

    const stats = await compile(compiler)
    // const { runtimeSet, classGenerator } = useStore()
    // expect(runtimeSet.size).toBeGreaterThan(0)

    // expect(classGenerator.newClassSize).toBeGreaterThan(0)
    expect(readAssets(compiler, stats)).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })
})
