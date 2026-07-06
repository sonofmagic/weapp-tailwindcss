import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import postcss, { type AcceptedPlugin } from 'postcss'
import tailwindcssPostcss from '@tailwindcss/postcss'
import tailwindcssVite from '@tailwindcss/vite'
import { build, type InlineConfig, type PluginOption } from 'vite'
import { createWeappTailwindcssGenerator, resolveTailwindV4Source } from 'weapp-tailwindcss/generator'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import type { BenchmarkCaseResult, BenchmarkFixtureInfo } from './types'

export interface CaseRunResult {
  css: string
  classSetSize?: number
  selectorCount?: number
  details?: Record<string, unknown>
}

export interface BenchmarkCase {
  id: string
  name: string
  mode: BenchmarkCaseResult['mode']
  plugin: string
  run: () => Promise<CaseRunResult>
}

export function countSelectors(css: string) {
  const matches = css.match(/(^|})\s*[^@{}][^{]*\{/g)
  return matches?.length ?? 0
}

async function runPostcss(css: string, from: string) {
  const result = await postcss([tailwindcssPostcss()]).process(css, {
    from,
  })
  return {
    css: result.css,
    selectorCount: countSelectors(result.css),
  }
}

async function runViteBuild(root: string, plugins: PluginOption[], cssPostcssPlugins?: AcceptedPlugin[]) {
  const outDir = path.join(root, 'dist', `case-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const config: InlineConfig = {
    root,
    logLevel: 'silent',
    plugins,
    build: {
      emptyOutDir: true,
      outDir,
      sourcemap: false,
      minify: false,
      rollupOptions: {
        input: path.join(root, 'index.html'),
      },
    },
  }
  if (cssPostcssPlugins) {
    config.css = {
      postcss: {
        plugins: cssPostcssPlugins,
      },
    }
  }
  await build(config)
  const cssDir = path.join(outDir, 'assets')
  let css = ''
  try {
    const files = await readdir(cssDir)
    const cssFiles = files.filter(file => file.endsWith('.css'))
    css = (await Promise.all(cssFiles.map(file => readFile(path.join(cssDir, file), 'utf8')))).join('\n')
  }
  catch {
    css = ''
  }
  return {
    css,
    selectorCount: countSelectors(css),
  }
}

export async function createBenchmarkCases(fixture: BenchmarkFixtureInfo): Promise<BenchmarkCase[]> {
  const css = await readFile(fixture.cssEntry, 'utf8')
  const source = await resolveTailwindV4Source({
    css,
    base: path.dirname(fixture.cssEntry),
    cwd: fixture.root,
    projectRoot: fixture.root,
  })
  const generator = createWeappTailwindcssGenerator(source)

  const directCandidates = fixture.candidates
  const appendedCandidates = [...fixture.candidates, ...fixture.appendedCandidates]
  const officialPostcssPlugin = tailwindcssPostcss() as AcceptedPlugin & { plugins?: AcceptedPlugin[] }
  const officialPostcssPlugins = officialPostcssPlugin.plugins ?? [officialPostcssPlugin]
  const viteWeappPlugins = WeappTailwindcss({
    tailwindcssBasedir: fixture.root,
    cssEntries: [fixture.cssEntry],
    generator: {
      target: 'weapp',
    },
  }) ?? []
  const viteWebPlugins = WeappTailwindcss({
    tailwindcssBasedir: fixture.root,
    cssEntries: [fixture.cssEntry],
    generator: {
      target: 'web',
    },
  }) ?? []

  return [
    {
      id: 'weapp-generator-scan-weapp',
      name: 'weapp-tailwindcss generator target=weapp scanSources=true',
      mode: 'generator',
      plugin: 'weapp-tailwindcss/generator',
      run: async () => {
        const result = await generator.generate({ target: 'weapp', scanSources: true })
        return { css: result.css, classSetSize: result.classSet.size }
      },
    },
    {
      id: 'weapp-generator-scan-web',
      name: 'weapp-tailwindcss generator target=web scanSources=true',
      mode: 'generator',
      plugin: 'weapp-tailwindcss/generator',
      run: async () => {
        const result = await generator.generate({ target: 'web', scanSources: true })
        return { css: result.css, classSetSize: result.classSet.size }
      },
    },
    {
      id: 'weapp-generator-candidates-weapp',
      name: 'weapp-tailwindcss generator target=weapp scanSources=false candidates',
      mode: 'generator',
      plugin: 'weapp-tailwindcss/generator',
      run: async () => {
        const result = await generator.generate({ target: 'weapp', scanSources: false, candidates: directCandidates })
        return { css: result.css, classSetSize: result.classSet.size }
      },
    },
    {
      id: 'weapp-generator-candidates-web',
      name: 'weapp-tailwindcss generator target=web scanSources=false candidates',
      mode: 'generator',
      plugin: 'weapp-tailwindcss/generator',
      run: async () => {
        const result = await generator.generate({ target: 'web', scanSources: false, candidates: directCandidates })
        return { css: result.css, classSetSize: result.classSet.size }
      },
    },
    {
      id: 'weapp-generator-incremental-cold',
      name: 'weapp-tailwindcss generator incrementalCache cold',
      mode: 'generator',
      plugin: 'weapp-tailwindcss/generator',
      run: async () => {
        const result = await generator.generate({
          target: 'weapp',
          incrementalCache: true,
          scanSources: false,
          candidates: directCandidates.slice(0, 96),
        })
        return { css: result.css, classSetSize: result.classSet.size }
      },
    },
    {
      id: 'weapp-generator-incremental-hit',
      name: 'weapp-tailwindcss generator incrementalCache hit',
      mode: 'generator',
      plugin: 'weapp-tailwindcss/generator',
      run: async () => {
        await generator.generate({
          target: 'weapp',
          incrementalCache: true,
          scanSources: false,
          candidates: directCandidates.slice(0, 96),
        })
        const result = await generator.generate({
          target: 'weapp',
          incrementalCache: true,
          scanSources: false,
          candidates: directCandidates.slice(0, 96),
        })
        return { css: result.css, classSetSize: result.classSet.size }
      },
    },
    {
      id: 'weapp-generator-incremental-append',
      name: 'weapp-tailwindcss generator incrementalCache append',
      mode: 'generator',
      plugin: 'weapp-tailwindcss/generator',
      run: async () => {
        await generator.generate({
          target: 'weapp',
          incrementalCache: true,
          scanSources: false,
          candidates: directCandidates.slice(0, 96),
        })
        const result = await generator.generate({
          target: 'weapp',
          incrementalCache: true,
          scanSources: false,
          candidates: appendedCandidates.slice(0, 120),
        })
        return {
          css: result.css,
          classSetSize: result.classSet.size,
          details: {
            incrementalCssBytes: Buffer.byteLength(result.incrementalCss ?? ''),
          },
        }
      },
    },
    {
      id: 'official-postcss-core',
      name: '@tailwindcss/postcss direct postcss process',
      mode: 'generator',
      plugin: '@tailwindcss/postcss',
      run: () => runPostcss(css, fixture.cssEntry),
    },
    {
      id: 'vite-official-postcss',
      name: 'Vite build + @tailwindcss/postcss',
      mode: 'vite-build',
      plugin: '@tailwindcss/postcss',
      run: () => runViteBuild(fixture.root, [], officialPostcssPlugins),
    },
    {
      id: 'vite-official-vite',
      name: 'Vite build + @tailwindcss/vite',
      mode: 'vite-build',
      plugin: '@tailwindcss/vite',
      run: () => runViteBuild(fixture.root, [tailwindcssVite()]),
    },
    {
      id: 'vite-weapp-target-weapp',
      name: "Vite build + weapp-tailwindcss/vite generator.target='weapp'",
      mode: 'vite-build',
      plugin: 'weapp-tailwindcss/vite',
      run: () => runViteBuild(fixture.root, viteWeappPlugins),
    },
    {
      id: 'vite-weapp-target-web',
      name: "Vite build + weapp-tailwindcss/vite generator.target='web'",
      mode: 'vite-build',
      plugin: 'weapp-tailwindcss/vite',
      run: () => runViteBuild(fixture.root, viteWebPlugins),
    },
  ]
}
