import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { visualizer } from 'rollup-plugin-visualizer'
import type { PackageJson } from 'pkg-types'
// import terser from '@rollup/plugin-terser'
import { readFileSync } from 'node:fs'
// import { resolve } from 'path'
import type { RollupOptions } from 'rollup'
import { excludeKeys } from './filter-obj'
import * as path from 'path'
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
    external: [...(pkg.dependencies ? Object.keys(pkg.dependencies) : []), 'webpack', 'loader-utils']
  }
}
// 没有必要压缩徒增调试成本
// if (isProd) {
//   sharedConfig.plugins.push(terser())
// }

const mainOutputOptions: Partial<RollupOptions['output']> = {
  format: 'cjs',
  sourcemap: isDev || isDemo,
  exports: 'auto',
  esModule: true,
  generatedCode: {
    reservedNamesAsProps: false
  },
  interop: 'compat',
  systemNullSetters: false,
  sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
    if (isDemo) {
      return path.resolve(path.dirname(sourcemapPath), '../../../', relativeSourcePath.replace(/\.\.[\\/]/g, ''))
    }
    return relativeSourcePath
  }
}

const replaceOutputOptions: Partial<RollupOptions['output']> = {
  format: 'esm',
  sourcemap: isDev || isDemo,
  esModule: true,
  generatedCode: {
    reservedNamesAsProps: false
  },
  interop: 'compat',
  systemNullSetters: false,
  sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
    if (isDemo) {
      return path.resolve(path.dirname(sourcemapPath), '../../../', relativeSourcePath.replace(/\.\.[\\/]/g, ''))
    }
    return relativeSourcePath
  }
}

const entries: IEntry[] = [
  {
    name: 'bundle',
    input: {
      index: 'src/index.ts',
      'jsx-rename-loader': 'src/loader/jsx-rename-loader.ts',
      // vite: 'src/framework/vite/index.ts',
      gulp: 'src/framework/gulp/index.ts',
      postcss: 'src/postcss/plugin.ts',
      cli: 'src/cli.ts',
      v4: 'src/v4.ts',
      v5: 'src/v5.ts'
    },
    output: [
      {
        dir: isDemo ? 'demo/web/weapp-tw-dist' : 'dist',
        ...mainOutputOptions
      }
    ]
  },
  {
    name: 'replace',
    input: 'src/replace.ts',
    output: [
      {
        file: isDemo ? 'demo/web/weapp-tw-dist/replace.js' : 'dist/replace.js',
        ...replaceOutputOptions
      }
    ]
  },
  {
    name: 'vite',
    input: 'src/framework/vite/index.ts',
    output: [
      {
        file: isDemo ? 'demo/web/weapp-tw-dist/vite.js' : 'dist/vite.js',
        format: 'cjs',
        sourcemap: isDev || isDemo,
        exports: 'auto',
        interop: 'auto'
      }
    ]
  }
]

const config = entries.map((x) => {
  return {
    ...excludeKeys(x, ['name']),
    ...createSharedConfig(x)
  }
}) as RollupOptions[]

export default config
