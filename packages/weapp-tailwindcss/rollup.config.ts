import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import lodash from 'lodash'
import { visualizer } from 'rollup-plugin-visualizer'
import type { PackageJson } from 'pkg-types'
// import terser from '@rollup/plugin-terser'
import type { RollupOptions } from 'rollup'

const { omit } = lodash
const pkg = JSON.parse(
  readFileSync('./package.json', {
    encoding: 'utf8',
  }),
) as PackageJson
const __dirname = dirname(fileURLToPath(import.meta.url))

const isProd = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'

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
        preferBuiltins: true,
      }),
      commonjs(),
      typescript({
        tsconfig: resolve(__dirname, './tsconfig.build.json'),
        sourceMap: isDev,
        declaration: true,
      }),
      isProd
        ? visualizer({
          // emitFile: true,
          filename: `stats/${entry.name}.html`,
        })
        : undefined,
    ],
    external: [...(pkg.dependencies ? Object.keys(pkg.dependencies) : []), 'webpack', 'loader-utils', 'tailwindcss/plugin', '@ast-grep/napi', '@weapp-tailwindcss/cli'],
  }
}
// 没有必要压缩徒增调试成本
// if (isProd) {
//   sharedConfig.plugins.push(terser())
// }

const mainOutputOptions: Partial<RollupOptions['output']> = {
  sourcemap: isDev,
  exports: 'auto',
  esModule: true,
  generatedCode: {
    reservedNamesAsProps: false,
  },
  interop: 'compat',
  systemNullSetters: false,
}

const entries: IEntry[] = [
  {
    name: 'bundle',
    input: {
      'index': 'src/index.ts',
      'webpack': 'src/webpack.ts',
      'webpack4': 'src/webpack4.ts',
      'gulp': 'src/gulp.ts',
      'postcss': 'src/postcss.ts',
      'cli': 'src/cli.ts',
      'replace': 'src/replace.ts',
      'vite': 'src/vite.ts',
      'weapp-tw-runtime-loader': 'src/bundlers/webpack/loaders/weapp-tw-runtime-loader.ts',
      'defaults': 'src/defaults.ts',
      'css-macro/index': 'src/css-macro/index.ts',
      'css-macro/postcss': 'src/css-macro/postcss.ts',
      'core': 'src/core.ts',
    },
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        ...mainOutputOptions,
      },
      {
        dir: 'dist',
        format: 'esm',
        ...mainOutputOptions,
        entryFileNames: '[name].mjs',
        chunkFileNames: '[name]-[hash].mjs',
      },
    ],
  },
]

const config = entries.map((x) => {
  return {
    ...omit(x, ['name']),
    ...createSharedConfig(x),
  }
}) as RollupOptions[]

export default config
