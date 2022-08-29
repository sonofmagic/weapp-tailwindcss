import path from 'path'
import { getCompiler5, compile } from './helpers'
import optimizer from '@/mangle/optimize'
import type { Compiler, Configuration } from 'webpack'
import type { IMangleOptions } from '@/types'
import ClassGenerator from '@/mangle/classGenerator'
class ManglePlugin {
  public opts: IMangleOptions
  constructor (opts: IMangleOptions = {}) {
    this.opts = opts
  }

  apply (compiler: Compiler) {
    compiler.hooks.compilation.tap('ManglePluginHooks', (compilation) => {
      const optimize = optimizer(compiler, compilation, this.opts)
      compilation.hooks.processAssets.tap('WeappTailwindcssWebpackPluginOptimizeChunkAssetsHooks', (chunks) => {
        optimize(chunks)
      })
    })
  }
}
const webpackMajorVersion = Number(require('webpack/package.json').version.split('.')[0])
// if (webpackMajorVersion < 4) {
//   const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin')
// }

const OUTPUT_DIR = path.join(__dirname, './dist')

const testPlugin = async (webpackConfig: Configuration, expectedResults: (string | RegExp)[], expectErrors?: boolean, expectWarnings?: boolean) => {
  if (webpackMajorVersion >= 4) {
    webpackConfig.mode = 'development'
    // @ts-ignore
    if (webpackConfig.module && webpackConfig.module.loaders) {
      // @ts-ignore
      webpackConfig.module.rules = webpackConfig.module.loaders
      // @ts-ignore
      delete webpackConfig.module.loaders
    }
  }
  // if (webpackConfig.__commonsChunk) {
  //   if (webpackMajorVersion < 4) {
  //     webpackConfig.plugins = webpackConfig.plugins || []
  //     webpackConfig.plugins.unshift(new CommonsChunkPlugin(webpackConfig.__commonsChunk))
  //   } else {
  //     webpackConfig.optimization = transformCommonChunkConfigToOptimization(webpackConfig.__commonsChunk)
  //   }
  //   delete webpackConfig.__commonsChunk
  // }
  const compiler = getCompiler5(webpackConfig)

  const stats = await compile(compiler)
  const compilationErrors = (stats.compilation.errors || []).join('\n')
  if (expectErrors) {
    expect(compilationErrors).not.toBe('')
  } else {
    expect(compilationErrors).toBe('')
  }
  const compilationWarnings = (stats.compilation.warnings || []).join('\n')
  if (expectWarnings) {
    expect(compilationWarnings).not.toBe('')
  } else {
    expect(compilationWarnings).toBe('')
  }
  // @ts-ignore
  // const outputFileExists = fs.existsSync(path.join(OUTPUT_DIR, webpackConfig.output.filename))
  // expect(outputFileExists).toBe(true)
  // if (!outputFileExists) {
  //   return
  // }
  // @ts-ignore
  // const content = fs.readFileSync(path.join(OUTPUT_DIR, webpackConfig.output.filename)).toString()
  // for (let i = 0; i < expectedResults.length; i++) {
  //   const expectedResult = expectedResults[i]
  //   if (expectedResult instanceof RegExp) {
  //     expect(content).toMatch(expectedResult)
  //   } else {
  //     expect(content).toContain(expectedResult)
  //   }
  // }
}

const defaultCssClassRegExp = '[cl]-[a-z][a-zA-Z0-9_]*'

describe('ManglePlugin', () => {
  it('replace a css class', async () => {
    await testPlugin(
      {
        entry: [path.join(__dirname, 'fixtures/mangle/case1.js')],
        output: {
          path: OUTPUT_DIR,
          filename: 'case1.js'
        },
        plugins: [
          new ManglePlugin({
            classNameRegExp: defaultCssClassRegExp,
            log: true
          })
        ]
      },
      ['<p class=\\"a\\">l-a</p>']
    )
  })

  it('replace multiple css classes with css and html', async () => {
    await testPlugin(
      {
        entry: path.join(__dirname, 'fixtures/mangle/case2.js'),
        output: {
          path: OUTPUT_DIR,
          filename: 'case2.js'
        },
        module: {
          rules: [
            {
              test: /\.css$/,
              use: ['style-loader', 'css-loader']
            },
            {
              test: /\.html$/,
              use: {
                loader: 'html-loader'
              }
            }
          ]
        },
        plugins: [
          new ManglePlugin({
            classNameRegExp: defaultCssClassRegExp,
            log: true
          })
        ]
      },
      [".a {\\\\n  width: '100%';\\\\n}", '<div class=\\\\\\"a\\\\\\">', '<p class=\\"a b a\\"><div /><a class=\\"b\\">l-a</p>']
    )
  })

  it('ensure ignore custom classname prefixes', async () => {
    await testPlugin(
      {
        entry: path.join(__dirname, 'fixtures/mangle/case3.js'),
        output: {
          path: OUTPUT_DIR,
          filename: 'case3.js'
        },
        module: {
          rules: [
            {
              test: /\.css$/,
              use: ['style-loader', 'css-loader']
            },
            {
              test: /\.html$/,
              use: {
                loader: 'html-loader'
              }
            }
          ]
        },
        plugins: [
          new ManglePlugin({
            classNameRegExp: '(xs:|md:)?[cl]-[a-z][a-zA-Z0-9_]*',
            ignorePrefix: ['xs:', 'md:'],
            log: true
          })
        ]
      },
      ['<div class=\\\\\\"a xs:a md:b\\\\\\">\\\\n      <p>l-a</p>\\\\n      <p>md:l-b</p>\\\\n    </div>']
    )
  })

  it('do not have dupplicate class name', () => {
    const classes = new Set()
    const classGenerator = new ClassGenerator()
    const n = 40
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          const className = classGenerator.generateClassName(`l-${i}-${j}-${k}`, { log: false })
          classes.add(className.name)
        }
      }
    }
    console.log('Generated class size:', classes.size)
    expect(classes.size).toBe(Math.pow(n, 3))
    expect(classes).toContain('a')
    expect(classes).toContain('_')
    expect(classes).toContain('a9')
    expect(classes).toContain('aaa')
    expect(classes).toContain('_99')
  })

  it('do not use reserved class names', () => {
    const reservedClassNames = ['b', 'd']
    const classes = new Set()
    const classGenerator = new ClassGenerator()
    const n = 3
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          const className = classGenerator.generateClassName(`l-${i}-${j}-${k}`, {
            reserveClassName: reservedClassNames,
            log: true
          })
          classes.add(className.name)
        }
      }
    }
    console.log('Generated class size:', classes.size)
    expect(classes.size).toBe(Math.pow(n, 3))
    expect(classes).toContain('a')
    expect(classes).not.toContain('b')
    expect(classes).toContain('c')
    expect(classes).not.toContain('d')
    expect(classes).toContain('e')
  })

  it('ignore escape char in class name', () => {
    const classGenerator = new ClassGenerator()
    const classNameWithEscape = classGenerator.generateClassName('l-\\/a\\/b', {
      log: true
    })
    const classNameWithoutEscape = classGenerator.generateClassName('l-/a/b', {
      log: true
    })
    expect(classNameWithEscape.name).toBe(classNameWithoutEscape.name)
  })

  it('override class name generator', async () => {
    await testPlugin(
      {
        entry: [path.join(__dirname, 'fixtures/mangle/case4.js')],
        output: {
          path: OUTPUT_DIR,
          filename: 'case4.js'
        },
        plugins: [
          new ManglePlugin({
            classNameRegExp: defaultCssClassRegExp,
            log: true,
            classGenerator: (original, opts, context) => {
              if (!context.id) {
                context.id = 1
              }
              if (original.startsWith('c-')) {
                const className = `c${context.id}`
                context.id++
                return className
              }
            }
          })
        ]
      },
      ['<p class=\\"c1\\">hoge-a<div class=\\"b c1\\">CASE 4</div></p>']
    )
  })
})
