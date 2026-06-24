import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, build as viteBuild } from 'vite'
import dts from 'vite-plugin-dts'

const CSS_EXT_RE = /\.css$/

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const srcDir = path.resolve(rootDir, 'src')
const declarationIncludes = [
  'src/**/*.d.ts',
  'src/**/*.ts',
  'src/**/*.tsx',
]

if (!process.env.TAILWIND_CONFIG) {
  process.env.TAILWIND_CONFIG = path.resolve(rootDir, 'tailwind.config.ts')
}

function wxssMirror() {
  return {
    name: 'wxss-mirror',
    generateBundle(_options, bundle) {
      for (const [fileName, output] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && output.type === 'asset' && typeof output.source === 'string') {
          this.emitFile({
            type: 'asset',
            fileName: fileName.replace(CSS_EXT_RE, '.wxss'),
            source: output.source,
          })
        }
      }
    },
  }
}

function removeEmptyJsChunks() {
  return {
    name: 'remove-empty-js-chunks',
    generateBundle(_options, bundle) {
      for (const key of Object.keys(bundle)) {
        const chunk = bundle[key]
        if (chunk.type === 'chunk' && chunk.isEntry && chunk.code.trim() === '') {
          delete bundle[key]
        }
      }
    },
  }
}

const cssBuildConfig = {
  configFile: false,
  root: rootDir,
  publicDir: false,
  plugins: [tailwindcss(), wxssMirror(), removeEmptyJsChunks()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: '.',
    rollupOptions: {
      input: {
        index: path.resolve(srcDir, 'index.css'),
      },
      output: {
        assetFileNames: '[name][extname]',
      },
    },
  },
} satisfies import('vite').InlineConfig

export default defineConfig(async ({ command, mode }) => {
  if (command === 'build') {
    await viteBuild({ ...cssBuildConfig, mode })
  }

  return {
    root: rootDir,
    publicDir: false,
    plugins: [
      dts({
        entryRoot: srcDir,
        tsconfigPath: path.resolve(rootDir, 'tsconfig.build.json'),
        outDir: path.resolve(rootDir, 'dist'),
        include: declarationIncludes,
        copyDtsFiles: false,
        strictOutput: true,
      }),
    ],
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      assetsDir: '.',
      lib: {
        entry: {
          'variants': path.resolve(srcDir, 'variants.ts'),
          'preset': path.resolve(srcDir, 'preset.ts'),
          'components/index': path.resolve(srcDir, 'components/index.ts'),
          'hooks/index': path.resolve(srcDir, 'hooks/index.ts'),
          'utils/index': path.resolve(srcDir, 'utils/index.ts'),
          'adapters/index': path.resolve(srcDir, 'adapters/index.ts'),
        },
        formats: ['es', 'cjs'],
        fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
      },
      rollupOptions: {
        external: [
          '@weapp-tailwindcss/merge',
          '@weapp-tailwindcss/variants',
          '@tarojs/components',
          'react',
          'react/jsx-runtime',
          'tailwind-variants',
          'tailwindcss',
          'tailwindcss/plugin',
        ],
      },
    },
  }
})
