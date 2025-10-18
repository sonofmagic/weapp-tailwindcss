import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, build as viteBuild } from 'vite'
import dts from 'vite-plugin-dts'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const srcDir = path.resolve(rootDir, 'src')

function wxssMirror() {
  return {
    name: 'wxss-mirror',
    generateBundle(_options, bundle) {
      for (const [fileName, output] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && output.type === 'asset' && typeof output.source === 'string') {
          this.emitFile({
            type: 'asset',
            fileName: fileName.replace(/\.css$/, '.wxss'),
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
        include: ['src/variants.ts'],
        copyDtsFiles: false,
        strictOutput: true,
      }),
    ],
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      assetsDir: '.',
      lib: {
        entry: path.resolve(srcDir, 'variants.ts'),
        formats: ['es', 'cjs'],
        fileName: format => (format === 'es' ? 'variants.js' : 'variants.cjs'),
      },
      rollupOptions: {
        external: ['tailwind-merge', 'tailwind-variants'],
      },
    },
  }
})
