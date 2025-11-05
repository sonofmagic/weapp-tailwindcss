import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import postcss from 'postcss'
import { defineConfig, build as viteBuild } from 'vite'
import dts from 'vite-plugin-dts'
import { loadTailwindcss3 } from './scripts/load-tailwindcss3'
import { weappTailwindcssUIPreset } from './src/preset'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const srcDir = path.resolve(rootDir, 'src')

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

    const tailwindcss3 = await loadTailwindcss3(rootDir)
    const cssSource = await readFile(path.resolve(srcDir, 'index.css'), 'utf8')
    const tailwind3Result = await postcss([
      tailwindcss3({
        presets: [weappTailwindcssUIPreset],
        corePlugins: { preflight: false },
        content: [{ raw: '', extension: 'html' }],
      }),
    ]).process(cssSource, { from: path.resolve(srcDir, 'index.css') })

    const css3Path = path.resolve(rootDir, 'dist/index.tailwind3.css')
    await writeFile(css3Path, tailwind3Result.css, 'utf8')
    await writeFile(css3Path.replace(/\.css$/, '.wxss'), tailwind3Result.css, 'utf8')
  }

  return {
    root: rootDir,
    publicDir: false,
    plugins: [
      dts({
        entryRoot: srcDir,
        tsconfigPath: path.resolve(rootDir, 'tsconfig.build.json'),
        outDir: path.resolve(rootDir, 'dist'),
        include: ['src/variants.ts', 'src/preset.ts'],
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
          variants: path.resolve(srcDir, 'variants.ts'),
          preset: path.resolve(srcDir, 'preset.ts'),
        },
        formats: ['es', 'cjs'],
        fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
      },
      rollupOptions: {
        external: ['tailwind-merge', 'tailwind-variants', 'tailwindcss', 'tailwindcss/plugin'],
      },
    },
  }
})
