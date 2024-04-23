import { readFileSync } from 'node:fs'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { visualizer } from 'rollup-plugin-visualizer'
import type { PackageJson } from 'pkg-types'
// import terser from '@rollup/plugin-terser'
// import { resolve } from 'path'
import type { RollupOptions } from 'rollup'
import lodash from 'lodash'
const { omit } = lodash
const pkg = JSON.parse(
  readFileSync('./package.json', {
    encoding: 'utf8'
  })
) as PackageJson

const isProd = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'
const isDemo = process.env.NODE_ENV === 'demo'

interface IEntry {
  name?: string
  input?: RollupOptions['input']
  output?: RollupOptions['output'][]
}

const createSharedConfig: (entry: IEntry) => RollupOptions = (entry) => {
  return {
    makeAbsoluteExternalsRelative: true,
    preserveEntrySignatures: 'strict',
    plugins: [
      json(),
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs(),
      typescript({
        tsconfig: isDemo ? './tsconfig.demo.json' : './tsconfig.build.json',
        sourceMap: isDev || isDemo,
        declaration: false
      }),
      isProd
        ? visualizer({
            // emitFile: true,
            filename: `stats/${entry.name}.html`
          })
        : undefined
    ],
    external: [...(pkg.dependencies ? Object.keys(pkg.dependencies) : []), 'webpack', 'loader-utils', 'tailwindcss/plugin', '@ast-grep/napi', '@weapp-tailwindcss/cli']
  }
}
// 没有必要压缩徒增调试成本
// if (isProd) {
//   sharedConfig.plugins.push(terser())
// }

const mainOutputOptions: Partial<RollupOptions['output']> = {
  sourcemap: isDev || isDemo,
  exports: 'auto',
  esModule: true,
  generatedCode: {
    reservedNamesAsProps: false
  },
  interop: 'compat',
  systemNullSetters: false
  // sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
  //   if (isDemo) {
  //     return path.resolve(path.dirname(sourcemapPath), '../../../', relativeSourcePath.replaceAll(/\.\.[/\\]/g, ''))
  //   }
  //   return relativeSourcePath
  // }
}

const entries: IEntry[] = [
  {
    name: 'bundle',
    input: {
      index: 'src/index.ts',
      webpack: 'src/webpack.ts',
      webpack4: 'src/webpack4.ts',
      gulp: 'src/gulp.ts',
      postcss: 'src/postcss.ts',
      cli: 'src/cli.ts',
      replace: 'src/replace.ts',
      vite: 'src/vite.ts',
      'weapp-tw-runtime-loader': 'src/bundlers/webpack/loaders/weapp-tw-runtime-loader.ts',
      defaults: 'src/defaults.ts',
      'css-macro/index': 'src/css-macro/index.ts',
      'css-macro/postcss': 'src/css-macro/postcss.ts',
      core: 'src/core.ts'
    },
    output: [
      {
        dir: isDemo ? 'demo/web/weapp-tw-dist' : 'dist',
        format: 'cjs',
        ...mainOutputOptions
      },
      {
        dir: isDemo ? 'demo/web/weapp-tw-dist' : 'dist',
        format: 'esm',
        ...mainOutputOptions,
        entryFileNames: '[name].mjs',
        chunkFileNames: '[name]-[hash].mjs'
      }
    ]
  }
  // {
  //   name: 'loader',
  //   input: {
  //     'weapp-tw-runtime-loader': 'src/webpack/loaders/weapp-tw-runtime-loader.ts'
  //   },
  //   output: [
  //     {
  //       dir: 'lib',
  //       format: 'cjs',
  //       ...mainOutputOptions
  //     }
  //   ]
  // }
]

const config = entries.map((x) => {
  return {
    ...omit(x, ['name']),
    ...createSharedConfig(x)
  }
}) as RollupOptions[]

export default config
