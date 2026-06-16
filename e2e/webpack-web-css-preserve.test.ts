import type { Configuration, Stats } from 'webpack'
import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { describe, expect, it } from 'vitest'
import webpack from 'webpack'

const require = createRequire(import.meta.url)
const repoRoot = path.resolve(__dirname, '..')
const ensureBuiltScript = path.resolve(repoRoot, 'scripts/ensure-weapp-tailwindcss-built.mjs')
const tailwindcssV4Root = path.dirname(require.resolve('tailwindcss4/package.json'))
const modes: Array<NonNullable<Configuration['mode']>> = ['development', 'production']

function ensureWeappTailwindcssBuilt() {
  const result = spawnSync(process.execPath, [ensureBuiltScript], {
    cwd: repoRoot,
    shell: process.platform === 'win32',
    stdio: 'pipe',
    env: {
      ...process.env,
      NODE_OPTIONS: process.env['NODE_OPTIONS'] ?? '--max-old-space-size=8192',
    },
  })

  if (result.status !== 0) {
    throw new Error(`构建 weapp-tailwindcss dist 失败，exit=${result.status}\n${result.stdout.toString()}${result.stderr.toString()}`)
  }
}

function compile(config: Configuration) {
  return new Promise<Stats>((resolve, reject) => {
    webpack(config, (error, stats) => {
      if (error) {
        reject(error)
        return
      }
      if (!stats) {
        reject(new Error('Webpack 未返回 stats'))
        return
      }
      if (stats.hasErrors()) {
        reject(new Error(stats.toString({
          colors: false,
          errorDetails: true,
        })))
        return
      }
      resolve(stats)
    })
  })
}

async function createFixture(mode: NonNullable<Configuration['mode']>) {
  const root = await mkdtemp(path.join(tmpdir(), `weapp-tw-webpack-web-${mode}-`))
  const srcDir = path.join(root, 'src')
  const outDir = path.join(root, 'dist')
  const nodeModulesDir = path.join(root, 'node_modules')
  await mkdir(srcDir, { recursive: true })
  await mkdir(nodeModulesDir, { recursive: true })
  await symlink(tailwindcssV4Root, path.join(nodeModulesDir, 'tailwindcss'), process.platform === 'win32' ? 'junction' : 'dir')
  await writeFile(path.join(srcDir, 'index.js'), [
    'import "./styles.css";',
    'document.body.innerHTML = \'<main class="home-hero rounded-full bg-[#07c160]">web</main>\';',
    '',
  ].join('\n'))
  await writeFile(path.join(srcDir, 'styles.css'), [
    '@import "tailwindcss" source(none);',
    '@source inline("rounded-full bg-[#07c160] text-[22px]");',
    '',
    '.navbar__brand { color: var(--ifm-navbar-link-color); }',
    '.home-hero { display: grid; }',
    '.home-v5 .home-facts { gap: 1rem; }',
    '',
  ].join('\n'))

  return {
    root,
    outDir,
  }
}

async function readOnlyCssAsset(outDir: string) {
  const cssFiles = (await readdir(outDir)).filter(file => file.endsWith('.css'))
  expect(cssFiles).toHaveLength(1)
  return await readFile(path.join(outDir, cssFiles[0]!), 'utf8')
}

describe('Webpack Web CSS assets', () => {
  it.each(modes)('preserves ordinary CSS after Tailwind generation in %s mode', async (mode) => {
    ensureWeappTailwindcssBuilt()
    const { WeappTailwindcss } = await import('weapp-tailwindcss/webpack')
    const fixture = await createFixture(mode)

    try {
      await compile({
        context: fixture.root,
        mode,
        entry: './src/index.js',
        output: {
          path: fixture.outDir,
          filename: 'bundle.js',
          clean: true,
        },
        module: {
          rules: [
            {
              test: /\.css$/i,
              use: [
                MiniCssExtractPlugin.loader,
                require.resolve('css-loader'),
              ],
            },
          ],
        },
        plugins: [
          new MiniCssExtractPlugin({
            filename: 'styles.css',
          }),
          new WeappTailwindcss({
            generator: {
              target: 'web',
            },
            tailwindcssBasedir: fixture.root,
          }),
        ],
      })

      const css = await readOnlyCssAsset(fixture.outDir)
      expect(css).toContain('.navbar__brand')
      expect(css).toContain('.home-hero')
      expect(css).toContain('.home-v5 .home-facts')
      expect(css).toContain('.rounded-full')
      expect(css).toContain('.bg-\\[\\#07c160\\]')
      expect(css).not.toContain('@import "tailwindcss"')
    }
    finally {
      await rm(fixture.root, { recursive: true, force: true })
    }
  })
})
