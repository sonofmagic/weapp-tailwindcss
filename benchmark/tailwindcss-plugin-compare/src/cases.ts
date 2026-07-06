import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { type AcceptedPlugin } from 'postcss'
import tailwindcssPostcss from '@tailwindcss/postcss'
import tailwindcssVite from '@tailwindcss/vite'
import { createWeappTailwindcssGenerator, resolveTailwindV4Source } from 'weapp-tailwindcss/generator'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { createViteHmrCase, runPostcss, runViteBuild } from './css-runners'
import type { BenchmarkCase, BenchmarkFixtureInfo } from './types'

interface CreateBenchmarkCasesOptions {
  includeHmr: boolean
  scenarioId: string
  scenarioName: string
}

function withScenario(
  options: Pick<CreateBenchmarkCasesOptions, 'scenarioId' | 'scenarioName'>,
  testCase: Omit<BenchmarkCase, 'scenarioId' | 'scenarioName'>,
): BenchmarkCase
function withScenario<T extends object>(
  options: Pick<CreateBenchmarkCasesOptions, 'scenarioId' | 'scenarioName'>,
  testCase: T,
): T & Pick<BenchmarkCase, 'scenarioId' | 'scenarioName'>
function withScenario<T extends object>(
  options: Pick<CreateBenchmarkCasesOptions, 'scenarioId' | 'scenarioName'>,
  testCase: T,
) {
  return {
    ...testCase,
    scenarioId: options.scenarioId,
    scenarioName: options.scenarioName,
  }
}

export async function createBenchmarkCases(
  fixture: BenchmarkFixtureInfo,
  options: CreateBenchmarkCasesOptions,
): Promise<BenchmarkCase[]> {
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
  const viteWebCompactPlugins = WeappTailwindcss({
    tailwindcssBasedir: fixture.root,
    cssEntries: [fixture.cssEntry],
    generator: {
      target: 'web',
      webCompat: true,
    },
  }) ?? []

  const cases: BenchmarkCase[] = [
    withScenario(options, {
      id: 'weapp-generator-scan-weapp',
      name: 'weapp-tailwindcss generator target=weapp scanSources=true',
      mode: 'generator',
      plugin: 'weapp-tailwindcss/generator',
      run: async () => {
        const result = await generator.generate({ target: 'weapp', scanSources: true })
        return { css: result.css, classSetSize: result.classSet.size }
      },
    }),
    withScenario(options, {
      id: 'weapp-generator-scan-web',
      name: 'weapp-tailwindcss generator target=web scanSources=true',
      mode: 'generator',
      plugin: 'weapp-tailwindcss/generator',
      run: async () => {
        const result = await generator.generate({ target: 'web', scanSources: true })
        return { css: result.css, classSetSize: result.classSet.size }
      },
    }),
    withScenario(options, {
      id: 'weapp-generator-candidates-weapp',
      name: 'weapp-tailwindcss generator target=weapp scanSources=false candidates',
      mode: 'generator',
      plugin: 'weapp-tailwindcss/generator',
      run: async () => {
        const result = await generator.generate({ target: 'weapp', scanSources: false, candidates: directCandidates })
        return { css: result.css, classSetSize: result.classSet.size }
      },
    }),
    withScenario(options, {
      id: 'weapp-generator-candidates-web',
      name: 'weapp-tailwindcss generator target=web scanSources=false candidates',
      mode: 'generator',
      plugin: 'weapp-tailwindcss/generator',
      run: async () => {
        const result = await generator.generate({ target: 'web', scanSources: false, candidates: directCandidates })
        return { css: result.css, classSetSize: result.classSet.size }
      },
    }),
    withScenario(options, {
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
    }),
    withScenario(options, {
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
    }),
    withScenario(options, {
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
    }),
    withScenario(options, {
      id: 'official-postcss-core',
      name: '@tailwindcss/postcss direct postcss process',
      mode: 'generator',
      plugin: '@tailwindcss/postcss',
      run: () => runPostcss(css, fixture.cssEntry, tailwindcssPostcss()),
    }),
    withScenario(options, {
      id: 'vite-official-postcss',
      name: 'Vite build + @tailwindcss/postcss',
      mode: 'vite-build',
      plugin: '@tailwindcss/postcss',
      run: () => runViteBuild(fixture.root, [], officialPostcssPlugins),
    }),
    withScenario(options, {
      id: 'vite-official-vite',
      name: 'Vite build + @tailwindcss/vite',
      mode: 'vite-build',
      plugin: '@tailwindcss/vite',
      run: () => runViteBuild(fixture.root, [tailwindcssVite()]),
    }),
    withScenario(options, {
      id: 'vite-weapp-target-weapp',
      name: "Vite build + weapp-tailwindcss/vite generator.target='weapp'",
      mode: 'vite-build',
      plugin: 'weapp-tailwindcss/vite',
      run: () => runViteBuild(fixture.root, viteWeappPlugins),
    }),
    withScenario(options, {
      id: 'vite-weapp-target-web',
      name: "Vite build + weapp-tailwindcss/vite generator.target='web'",
      mode: 'vite-build',
      plugin: 'weapp-tailwindcss/vite',
      run: () => runViteBuild(fixture.root, viteWebPlugins),
    }),
    withScenario(options, {
      id: 'vite-weapp-target-web-compact',
      name: "Vite build + weapp-tailwindcss/vite generator.target='web' webCompat=true",
      mode: 'vite-build',
      plugin: 'weapp-tailwindcss/vite',
      run: () => runViteBuild(fixture.root, viteWebCompactPlugins),
    }),
  ]

  if (options.includeHmr) {
    cases.push(
      createViteHmrCase({
        base: withScenario(options, {
          id: 'hmr-official-postcss',
          name: 'Vite dev HMR + @tailwindcss/postcss',
          mode: 'vite-hmr',
          plugin: '@tailwindcss/postcss',
        }),
        fixture,
        plugins: [],
        cssPostcssPlugins: officialPostcssPlugins,
      }),
      createViteHmrCase({
        base: withScenario(options, {
          id: 'hmr-official-vite',
          name: 'Vite dev HMR + @tailwindcss/vite',
          mode: 'vite-hmr',
          plugin: '@tailwindcss/vite',
        }),
        fixture,
        plugins: [tailwindcssVite()],
      }),
      createViteHmrCase({
        base: withScenario(options, {
          id: 'hmr-weapp-target-weapp',
          name: "Vite dev HMR + weapp-tailwindcss/vite generator.target='weapp'",
          mode: 'vite-hmr',
          plugin: 'weapp-tailwindcss/vite',
        }),
        fixture,
        plugins: viteWeappPlugins,
      }),
      createViteHmrCase({
        base: withScenario(options, {
          id: 'hmr-weapp-target-web',
          name: "Vite dev HMR + weapp-tailwindcss/vite generator.target='web'",
          mode: 'vite-hmr',
          plugin: 'weapp-tailwindcss/vite',
        }),
        fixture,
        plugins: viteWebPlugins,
      }),
      createViteHmrCase({
        base: withScenario(options, {
          id: 'hmr-weapp-target-web-compact',
          name: "Vite dev HMR + weapp-tailwindcss/vite generator.target='web' webCompat=true",
          mode: 'vite-hmr',
          plugin: 'weapp-tailwindcss/vite',
        }),
        fixture,
        plugins: viteWebCompactPlugins,
      }),
    )
  }

  return cases
}
