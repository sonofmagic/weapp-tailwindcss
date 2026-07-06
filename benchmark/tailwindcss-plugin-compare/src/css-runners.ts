import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import postcss, { type AcceptedPlugin } from 'postcss'
import { build, createServer, type InlineConfig, type PluginOption, type ViteDevServer } from 'vite'
import type { BenchmarkCase, BenchmarkFixtureInfo } from './types'

export function countSelectors(css: string) {
  const matches = css.match(/(^|})\s*[^@{}][^{]*\{/g)
  return matches?.length ?? 0
}

export async function runPostcss(css: string, from: string, plugin: AcceptedPlugin) {
  const result = await postcss([plugin]).process(css, {
    from,
  })
  return {
    css: result.css,
    selectorCount: countSelectors(result.css),
  }
}

function createViteConfig(root: string, plugins: PluginOption[], cssPostcssPlugins?: AcceptedPlugin[]): InlineConfig {
  const config: InlineConfig = {
    root,
    logLevel: 'silent',
    plugins,
  }
  if (cssPostcssPlugins) {
    config.css = {
      postcss: {
        plugins: cssPostcssPlugins,
      },
    }
  }
  return config
}

export async function runViteBuild(root: string, plugins: PluginOption[], cssPostcssPlugins?: AcceptedPlugin[]) {
  const outDir = path.join(root, 'dist', `case-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const config: InlineConfig = {
    ...createViteConfig(root, plugins, cssPostcssPlugins),
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

export function createViteHmrCase(options: {
  base: Omit<BenchmarkCase, 'run'>
  fixture: BenchmarkFixtureInfo
  plugins: PluginOption[]
  cssPostcssPlugins?: AcceptedPlugin[]
}): BenchmarkCase {
  let server: ViteDevServer | undefined
  let updateIndex = 0

  async function ensureServer() {
    if (!server) {
      server = await createServer({
        ...createViteConfig(options.fixture.root, options.plugins, options.cssPostcssPlugins),
        server: {
          middlewareMode: true,
          hmr: false,
        },
        appType: 'custom',
      })
      await server.transformRequest('/src/style.css?initial=1')
    }
    return server
  }

  return {
    ...options.base,
    async run() {
      const viteServer = await ensureServer()
      const candidate = options.fixture.hmrCandidates[updateIndex % options.fixture.hmrCandidates.length]!
      updateIndex += 1
      await writeFile(options.fixture.hmrSourceFile, `<div class="${candidate}">hmr ${updateIndex}</div>\n`, 'utf8')
      viteServer.watcher.emit('change', options.fixture.hmrSourceFile)
      viteServer.moduleGraph.invalidateAll()
      const transformed = await viteServer.transformRequest(`/src/style.css?hmr=${updateIndex}`)
      const css = transformed?.code ?? ''
      return {
        css,
        selectorCount: countSelectors(css),
        details: {
          hmrCandidate: candidate,
          hmrSourceFile: path.relative(options.fixture.root, options.fixture.hmrSourceFile),
        },
      }
    },
    async dispose() {
      await server?.close()
      server = undefined
    },
  }
}
