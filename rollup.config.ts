import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { visualizer } from 'rollup-plugin-visualizer'
import type { PackageJson } from 'pkg-types'
// import terser from '@rollup/plugin-terser'
import { readFileSync } from 'node:fs'
import type { RollupOptions } from 'rollup'
import { excludeKeys } from './filter-obj'
const pkg = JSON.parse(
  readFileSync('./package.json', {
    encoding: 'utf8'
  })
) as PackageJson

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
        preferBuiltins: true
      }),
      commonjs(),
      typescript({ tsconfig: './tsconfig.build.json', sourceMap: isDev, declaration: false }),
      isProd
        ? visualizer({
            // emitFile: true,
            filename: `stats/${entry.name}.html`
          })
        : undefined
    ],
    external: [...(pkg.dependencies ? Object.keys(pkg.dependencies) : []), 'webpack', 'loader-utils']
  }
}
// 没有必要压缩徒增调试成本
// if (isProd) {
//   sharedConfig.plugins.push(terser())
// }

const entries: IEntry[] = [
  {
    name: 'bundle',
    input: {
      index: 'src/index.ts',
      'jsx-rename-loader': 'src/loader/jsx-rename-loader.ts',
      vite: 'src/framework/vite/index.ts',
      postcss: 'src/postcss/plugin.ts',
      mangle: 'src/mangle/index.ts',
      cli: 'src/cli.ts',
      v4: 'src/v4.ts',
      v5: 'src/v5.ts'
    },
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        sourcemap: isDev,
        exports: 'auto',
        esModule: true,
        generatedCode: {
          reservedNamesAsProps: false
        },
        interop: 'compat',
        systemNullSetters: false
      }
    ]
  },
  // {
  //   name: 'index',
  //   input: 'src/index.ts',
  //   output: [
  //     {
  //       file: pkg.main,
  //       format: 'cjs',
  //       sourcemap: isDev,
  //       exports: 'auto'
  //     }
  //     // { format: 'esm', file: pkg.module, sourcemap: isDev }
  //   ]
  // },
  {
    name: 'replace',
    input: 'src/replace.ts',
    output: [
      {
        file: 'dist/replace.js',
        format: 'esm',
        sourcemap: isDev,
        esModule: true,
        generatedCode: {
          reservedNamesAsProps: false
        },
        interop: 'compat',
        systemNullSetters: false
      }
    ]
  }
  // {
  //   name: 'jsx-rename-loader',
  //   input: 'src/loader/jsx-rename-loader.ts',
  //   output: [
  //     {
  //       file: 'dist/jsx-rename-loader.js',
  //       format: 'cjs',
  //       sourcemap: isDev,
  //       exports: 'auto'
  //     }
  //   ]
  // },
  // {
  //   name: 'vite',
  //   input: 'src/framework/vite/index.ts',
  //   output: [
  //     {
  //       file: 'dist/vite.js',
  //       format: 'cjs',
  //       sourcemap: isDev,
  //       exports: 'auto'
  //     }
  //   ]
  // },
  // {
  //   name: 'postcss',
  //   input: 'src/postcss/plugin.ts',
  //   output: [
  //     {
  //       file: 'dist/postcss.js',
  //       format: 'cjs',
  //       sourcemap: isDev,
  //       exports: 'auto'
  //     }
  //   ]
  // },
  // {
  //   name: 'mangle',
  //   input: 'src/mangle/index.ts',
  //   output: [
  //     {
  //       file: 'dist/mangle.js',
  //       format: 'cjs',
  //       sourcemap: isDev,
  //       exports: 'auto'
  //     }
  //   ]
  // },
  // {
  //   name: 'cli',
  //   input: 'src/cli.ts',
  //   output: [
  //     {
  //       file: 'dist/cli.js',
  //       format: 'cjs',
  //       sourcemap: isDev,
  //       exports: 'auto'
  //     }
  //   ]
  // }
  // {
  //   input: 'src/v4.ts',
  //   output: [
  //     {
  //       file: 'dist/v4.js',
  //       format: 'cjs',
  //       sourcemap: isDev,
  //       exports: 'auto'
  //     }
  //   ]
  // },
  // {
  //   input: 'src/v5.ts',
  //   output: [
  //     {
  //       file: 'dist/v5.js',
  //       format: 'cjs',
  //       sourcemap: isDev,
  //       exports: 'auto'
  //     }
  //   ]
  // }
]

const config = entries.map((x) => {
  return {
    ...excludeKeys(x, ['name']),
    ...createSharedConfig(x)
  }
}) as RollupOptions[]

export default config
