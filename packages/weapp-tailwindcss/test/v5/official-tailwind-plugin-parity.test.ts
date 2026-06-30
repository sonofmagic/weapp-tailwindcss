import postcss, { type Root } from 'postcss'
import { mkdir, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import tailwindcssPostcss from '@tailwindcss/postcss'
import tailwindcssVite from '@tailwindcss/vite'
import { createServer } from 'vite'
import weappTailwindcss from '@/postcss'
import { WeappTailwindcss as weappTailwindcssVite } from '@/vite'

const require = createRequire(import.meta.url)
const tailwindcssPackageRoot = path.dirname(require.resolve('tailwindcss/package.json'))

const PARITY_CANDIDATES = [
  'flex',
  'grid',
  'grid-cols-3',
  'items-center',
  'justify-center',
  'space-y-4',
  'p-[32rpx]',
  'text-[55rpx]',
  'bg-brand',
  'text-[#fff]',
  'border-[10rpx]',
  '!border-brand',
  'rotate-[10deg]',
  'shadow-[0_8rpx_24rpx_rgba(0,0,0,0.18)]',
  'hover:bg-brand',
  'active:bg-brand',
  'dark:bg-zinc-800',
]

const PARITY_CSS = `
@theme {
  --color-brand: #155dfc;
  --color-zinc-800: #27272a;
}
@source not ".";
@source inline("${PARITY_CANDIDATES.join(' ')}");
@tailwind utilities;
`

const OFFICIAL_PLUGIN_CAPABILITIES = [
  {
    name: 'CSS-first 入口',
    officialPostcss: '@tailwindcss/postcss',
    officialVite: '@tailwindcss/vite',
    generatorPostcss: 'weapp-tailwindcss/postcss',
    generatorVite: 'weapp-tailwindcss/vite',
  },
  {
    name: '@source 扫描',
    officialPostcss: '扫描 Tailwind CSS v4 @source',
    officialVite: '扫描 Tailwind CSS v4 @source',
    generatorPostcss: '扫描 @source 并补充 PostCSS dependency',
    generatorVite: '复用 cssEntries 与 Tailwind v4 source',
  },
  {
    name: '@theme / @config',
    officialPostcss: 'Tailwind 设计 token',
    officialVite: 'Tailwind 设计 token',
    generatorPostcss: '复用同一 Tailwind 设计 token',
    generatorVite: '复用同一 Tailwind 设计 token',
  },
  {
    name: '候选类生成',
    officialPostcss: 'Scanner candidates',
    officialVite: 'Scanner candidates',
    generatorPostcss: 'classSet 精确命中 candidates',
    generatorVite: 'runtime classSet 精确命中 candidates',
  },
  {
    name: 'Web 产物',
    officialPostcss: '浏览器 CSS',
    officialVite: '浏览器 CSS',
    generatorPostcss: "target: 'web'",
    generatorVite: "target: 'web'",
  },
  {
    name: '小程序产物',
    officialPostcss: '不支持',
    officialVite: '不支持',
    generatorPostcss: "target: 'weapp'",
    generatorVite: "target: 'weapp'",
  },
  {
    name: '默认生成失败处理',
    officialPostcss: '构建失败',
    officialVite: '构建失败',
    generatorPostcss: '默认生成模式',
    generatorVite: '默认生成模式',
  },
  {
    name: '依赖追踪 / HMR',
    officialPostcss: 'dependency / dir-dependency',
    officialVite: 'addWatchFile / hotUpdate',
    generatorPostcss: 'dependency',
    generatorVite: 'cssEntries / dependencies / HMR',
  },
]

function normalizeCss(css: string) {
  return css.replace(/\s+/g, ' ')
}

function collectRuleBodies(root: Root) {
  const declarationsBySelector = new Map<string, Set<string>>()
  root.walkRules((rule) => {
    const declarations = declarationsBySelector.get(rule.selector) ?? new Set<string>()
    rule.walkDecls((decl) => {
      declarations.add(`${decl.prop}: ${decl.value}${decl.important ? ' !important' : ''}`)
    })
    declarationsBySelector.set(rule.selector, declarations)
  })
  return declarationsBySelector
}

function expectRuleDeclarationsIncluded(actualCss: string, expectedCss: string, selectors: string[]) {
  const actual = collectRuleBodies(postcss.parse(actualCss))
  const expected = collectRuleBodies(postcss.parse(expectedCss))

  for (const selector of selectors) {
    const actualDeclarations = actual.get(selector)
    const expectedDeclarations = expected.get(selector)
    expect(actualDeclarations, `missing actual selector ${selector}`).toBeDefined()
    expect(expectedDeclarations, `missing expected selector ${selector}`).toBeDefined()

    for (const declaration of expectedDeclarations ?? []) {
      expect(actualDeclarations, `${selector} should include ${declaration}`).toContain(declaration)
    }
  }
}

async function withViteCssImportFixture(
  css: string,
  plugins: any[],
  run: (result: { code: string, warnings: string[] }) => Promise<void> | void,
) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'weapp-tw-vite-import-order-')))
  const warnings: string[] = []
  try {
    await mkdir(path.join(root, 'src'), { recursive: true })
    await mkdir(path.join(root, 'node_modules'), { recursive: true })
    await symlink(tailwindcssPackageRoot, path.join(root, 'node_modules/tailwindcss'), 'dir')
    await writeFile(path.join(root, 'src/theme.css'), '@layer base { :root { --brand: red; } }\n', 'utf8')
    await writeFile(path.join(root, 'src/main.css'), css, 'utf8')
    await writeFile(path.join(root, 'src/main.ts'), 'import "./main.css"\n', 'utf8')
    await writeFile(path.join(root, 'index.html'), '<div class="flex"></div><script type="module" src="/src/main.ts"></script>', 'utf8')
    const server = await createServer({
      root,
      logLevel: 'silent',
      plugins,
      customLogger: {
        hasWarned: false,
        info() {},
        warn(message) {
          warnings.push(String(message))
          this.hasWarned = true
        },
        warnOnce(message) {
          warnings.push(String(message))
          this.hasWarned = true
        },
        error(message) {
          throw new Error(String(message))
        },
        clearScreen() {},
      },
    })
    try {
      await server.pluginContainer.buildStart({})
      const result = await server.transformRequest('/src/main.css')
      await run({
        code: result?.code ?? '',
        warnings,
      })
    }
    finally {
      await server.close()
    }
  }
  finally {
    await rm(root, { recursive: true, force: true })
  }
}

describe('v5 official tailwind plugin parity', () => {
  it('keeps target web output aligned with @tailwindcss/postcss for the same CSS-first input', async () => {
    const [officialResult, generatorResult] = await Promise.all([
      postcss([
        tailwindcssPostcss({
          optimize: false,
        }),
      ]).process(PARITY_CSS, {
        from: undefined,
      }),
      postcss([
        weappTailwindcss({
          packageName: 'tailwindcss4',
          generator: {
            target: 'web',
          },
        }),
      ]).process(PARITY_CSS, {
        from: undefined,
      }),
    ])

    expectRuleDeclarationsIncluded(generatorResult.css, officialResult.css, [
      '.flex',
      '.grid',
      '.grid-cols-3',
      '.items-center',
      '.justify-center',
      '.p-\\[32rpx\\]',
      '.text-\\[55rpx\\]',
      '.bg-brand',
      '.text-\\[\\#fff\\]',
      '.border-\\[10rpx\\]',
      '.\\!border-brand',
      '.rotate-\\[10deg\\]',
      '.shadow-\\[0_8rpx_24rpx_rgba\\(0\\,0\\,0\\,0\\.18\\)\\]',
    ])
    expect(normalizeCss(generatorResult.css)).toContain('@media (hover: hover)')
    expect(normalizeCss(generatorResult.css)).toContain('.hover\\:bg-brand')
    expect(normalizeCss(generatorResult.css)).toContain('.active\\:bg-brand')
    expect(normalizeCss(generatorResult.css)).toContain('.dark\\:bg-zinc-800')
    expect(generatorResult.messages).toContainEqual(expect.objectContaining({
      type: 'weapp-tailwindcss:generated',
      target: 'web',
    }))
  })

  it('lets official Vite handle local imports around Tailwind imports without PostCSS order warnings', async () => {
    await withViteCssImportFixture(
      [
        '@import "tailwindcss";',
        '@import "./theme.css";',
        '@source inline("flex");',
      ].join('\n'),
      [tailwindcssVite()],
      ({ code, warnings }) => {
        expect(warnings.join('\n')).not.toContain('@import must precede')
        expect(code).not.toContain('@import "./theme.css"')
        expect(code).toContain('--brand')
        expect(code).toContain('display: flex')
      },
    )
  })

  it('keeps weapp-tailwindcss Vite web generation from re-emitting local imports after generated CSS', async () => {
    await withViteCssImportFixture(
      [
        '@import "tailwindcss";',
        '@import "./theme.css";',
        '@source inline("flex");',
      ].join('\n'),
      [weappTailwindcssVite({
        generator: {
          target: 'web',
          webCompat: {
            preset: 'legacy-web',
          },
        },
      })],
      ({ code, warnings }) => {
        expect(warnings.join('\n')).not.toContain('@import must precede')
        expect(code).toContain('weapp-tailwindcss vite-generated-css')
        expect(code).not.toContain('@import "./theme.css"')
        expect(code).toContain('display: flex')
      },
    )
  })

  it('maps every @tailwindcss/postcss and @tailwindcss/vite capability to a v5 generator counterpart', () => {
    expect(OFFICIAL_PLUGIN_CAPABILITIES).toEqual([
      expect.objectContaining({ name: 'CSS-first 入口' }),
      expect.objectContaining({ name: '@source 扫描' }),
      expect.objectContaining({ name: '@theme / @config' }),
      expect.objectContaining({ name: '候选类生成' }),
      expect.objectContaining({ name: 'Web 产物' }),
      expect.objectContaining({ name: '小程序产物' }),
      expect.objectContaining({ name: '默认生成失败处理' }),
      expect.objectContaining({ name: '依赖追踪 / HMR' }),
    ])

    for (const capability of OFFICIAL_PLUGIN_CAPABILITIES) {
      expect(capability.officialPostcss).toBeTruthy()
      expect(capability.officialVite).toBeTruthy()
      expect(capability.generatorPostcss).toBeTruthy()
      expect(capability.generatorVite).toBeTruthy()
    }
  })
})
