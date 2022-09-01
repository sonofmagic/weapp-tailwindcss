import path from 'path'
import { getCompiler5, getCompiler4, compile, readAssets, getErrors, getWarnings } from './helpers'
import type { Configuration } from 'webpack'
import ClassGenerator from '@/mangle/classGenerator'
import { ManglePluginV5 } from '@/mangle/v5/plugin'
import { ManglePluginV4 } from '@/mangle/v4/plugin'

const webpackMajorVersion = Number(require('webpack/package.json').version.split('.')[0])
// if (webpackMajorVersion < 4) {
//   const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin')
// }

const OUTPUT_DIR = path.join(__dirname, './dist')

// const PluginMap: Record<number, typeof ManglePluginV4 | typeof ManglePluginV5> = {
//   4: ManglePluginV4,
//   5: ManglePluginV5
// }
describe.each([4, 5])('ManglePlugin Webpack%i', (webpackVersion) => {
  const ManglePlugin = webpackVersion === 4 ? ManglePluginV4 : ManglePluginV5
  const defaultCssClassRegExp = '[cl]-[a-z][a-zA-Z0-9_]*'
  const styleLoader = webpackVersion === 4 ? 'style-loader2' : 'style-loader'
  const htmlLoader = webpackVersion === 4 ? 'html-loader1' : 'html-loader'
  const cssLoader = webpackVersion === 4 ? 'css-loader3' : 'css-loader'
  const getCompiler = webpackVersion === 4 ? getCompiler4 : getCompiler5

  const testPlugin = async (webpackConfig: Configuration, expectedResults: (string | RegExp)[], expectErrors?: boolean, expectWarnings?: boolean) => {
    if (webpackMajorVersion >= 4) {
      webpackConfig.mode = 'development'
      webpackConfig.devtool = false
    }

    // @ts-ignore
    const compiler = getCompiler(webpackConfig)
    // @ts-ignore
    const stats = await compile(compiler)
    const compilationErrors = getErrors(stats).join('\n')
    if (expectErrors) {
      expect(compilationErrors).not.toBe('')
    } else {
      expect(compilationErrors).toBe('')
    }
    const compilationWarnings = getWarnings(stats).join('\n')
    if (expectWarnings) {
      expect(compilationWarnings).not.toBe('')
    } else {
      expect(compilationWarnings).toBe('')
    }
    // @ts-ignore
    const assets = readAssets(compiler, stats)
    const filename = webpackConfig?.output?.filename as string
    const content = assets[filename].replace(/\\r\\n/g, '\\n')
    for (let i = 0; i < expectedResults.length; i++) {
      const expectedResult = expectedResults[i]
      if (expectedResult instanceof RegExp) {
        expect(content).toMatch(expectedResult)
      } else {
        expect(content).toContain(expectedResult)
      }
    }
  }

  it('replace a css class', async () => {
    await testPlugin(
      {
        entry: [path.join(__dirname, 'fixtures/mangle/case1.js')],
        output: {
          path: OUTPUT_DIR,
          filename: 'case1.js'
        },
        plugins: [
          // @ts-ignore
          new ManglePlugin({
            classNameRegExp: defaultCssClassRegExp,
            log: false
          })
        ]
      },
      ['<p class="a">l-a</p>']
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
              use: [styleLoader, cssLoader]
            },
            {
              test: /\.html$/,
              use: {
                loader: htmlLoader
              }
            }
          ]
        },
        plugins: [
          // @ts-ignore
          new ManglePlugin({
            classNameRegExp: defaultCssClassRegExp,
            log: false
          })
        ]
      },
      [".a {\\n  width: '100%';\\n}", '<div class=\\"a\\">', '<p class="a b a"><div /><a class="b">l-a</p>']
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
              use: [styleLoader, cssLoader]
            },
            {
              test: /\.html$/,
              use: {
                loader: htmlLoader
              }
            }
          ]
        },
        plugins: [
          // @ts-ignore
          new ManglePlugin({
            classNameRegExp: '(xs:|md:)?[cl]-[a-z][a-zA-Z0-9_]*',
            ignorePrefix: ['xs:', 'md:'],
            log: false
          })
        ]
      },
      ['<div class=\\"a xs:a md:b\\">\\n      <p>l-a</p>\\n      <p>md:l-b</p>\\n    </div>']
    )
  })

  it('do not have dupplicate class name', () => {
    const classes = new Set()
    const classGenerator = new ClassGenerator({ log: false })
    const n = 40
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          const className = classGenerator.generateClassName(`l-${i}-${j}-${k}`)
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
    const classGenerator = new ClassGenerator({
      reserveClassName: reservedClassNames,
      log: false
    })
    const n = 3
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          const className = classGenerator.generateClassName(`l-${i}-${j}-${k}`)
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
    const classGenerator = new ClassGenerator({
      log: false
    })
    const classNameWithEscape = classGenerator.generateClassName('l-\\/a\\/b')
    const classNameWithoutEscape = classGenerator.generateClassName('l-/a/b')
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
          // @ts-ignore
          new ManglePlugin({
            classNameRegExp: defaultCssClassRegExp,
            log: false,
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
      ['<p class="c1">hoge-a<div class="b c1">CASE 4</div></p>']
    )
  })
})
