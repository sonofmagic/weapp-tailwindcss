import { access, mkdir, mkdtemp, symlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import plugin from 'tailwindcss/plugin'
import { createTailwindV3Engine, resolveTailwindV3Source } from '@/tailwindcss/v3-engine'
import { createTailwindV4Engine, resolveTailwindV4Source } from '@/tailwindcss/v4-engine'

const require = createRequire(import.meta.url)
const packageRoot = path.resolve(__dirname, '../..')
const workspaceRoot = path.resolve(packageRoot, '../..')
const pluginPackageRoots = [
  path.join(workspaceRoot, 'demo/uni-app-vite-tailwindcss-v3'),
  path.join(workspaceRoot, 'demo/uni-app-vite-tailwindcss-v4'),
  path.join(workspaceRoot, 'website'),
]
const tailwindcss3Root = path.dirname(require.resolve('tailwindcss/package.json'))
const tailwindcss4Root = path.dirname(require.resolve('tailwindcss4/package.json'))
const linkedPackages = [
  '@egoist/tailwindcss-icons',
  '@iconify-json/lucide',
  '@iconify-json/mdi',
  '@iconify/tailwind',
  '@tailwindcss/aspect-ratio',
  '@tailwindcss/container-queries',
  '@tailwindcss/forms',
  '@tailwindcss/line-clamp',
  '@tailwindcss/typography',
]
const pluginCandidates = [
  'form-input',
  'prose',
  'aspect-w-16',
  'aspect-h-9',
  '@container',
  '@lg:underline',
  'line-clamp-2',
  'i-mdi-home',
  'i-lucide-house',
  'ei-[mdi--home]',
  'icon--mdi',
  'icon--mdi--home',
  'iconify',
  'iconify-mdi-home',
  'icon-[mdi--home]',
  'plugin-card',
  'plugin-scrollbar',
  'plugin-size-card',
]

function compactCss(css: string) {
  return css.replace(/\s+/g, '')
}

async function findPackageRoot(resolvedFile: string) {
  let dir = path.dirname(resolvedFile)
  while (dir !== path.dirname(dir)) {
    try {
      await access(path.join(dir, 'package.json'))
      return dir
    }
    catch {
      dir = path.dirname(dir)
    }
  }
  throw new Error(`Unable to find package root for ${resolvedFile}`)
}

function resolvePluginPackage(packageName: string) {
  return require.resolve(packageName, {
    paths: pluginPackageRoots,
  })
}

function expectIconCss(css: string) {
  expect(css).toContain('--svg')
  expect(css).toMatch(/mask|background/)
}

async function createPluginFixture(tailwindcssRoot: string) {
  const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-plugin-compat-'))
  const nodeModulesDir = path.join(root, 'node_modules')
  await mkdir(nodeModulesDir, { recursive: true })
  await symlink(tailwindcssRoot, path.join(nodeModulesDir, 'tailwindcss'), 'dir')

  for (const packageName of linkedPackages) {
    const resolvedFile = resolvePluginPackage(packageName)
    const packageDir = await findPackageRoot(resolvedFile)
    const target = path.join(nodeModulesDir, ...packageName.split('/'))
    await mkdir(path.dirname(target), { recursive: true })
    await symlink(packageDir, target, 'dir')
  }

  return root
}

function createV3Config(root: string) {
  const fixtureRequire = createRequire(path.join(root, 'tailwind.config.cjs'))
  const { iconsPlugin, dynamicIconsPlugin, getIconCollections } = fixtureRequire('@egoist/tailwindcss-icons') as typeof import('@egoist/tailwindcss-icons')
  const { addCleanIconSelectors, addDynamicIconSelectors, addIconSelectors } = fixtureRequire('@iconify/tailwind') as typeof import('@iconify/tailwind')
  return {
    content: [],
    theme: {
      extend: {
        colors: {
          brand: '#123456',
        },
      },
    },
    plugins: [
      fixtureRequire('@tailwindcss/forms'),
      fixtureRequire('@tailwindcss/typography'),
      fixtureRequire('@tailwindcss/aspect-ratio'),
      fixtureRequire('@tailwindcss/container-queries'),
      fixtureRequire('@tailwindcss/line-clamp'),
      iconsPlugin({
        collections: getIconCollections(['mdi', 'lucide']),
      }),
      dynamicIconsPlugin({ prefix: 'ei' }),
      addCleanIconSelectors('mdi:home'),
      addIconSelectors({
        prefixes: [{ prefix: 'mdi', icons: ['home'] }],
        iconSelector: '.iconify-{prefix}-{name}',
      }),
      addDynamicIconSelectors(),
      plugin(({ addComponents, addUtilities, matchUtilities, theme }) => {
        addComponents({
          '.plugin-card': {
            color: theme('colors.brand'),
          },
        })
        addUtilities({
          '.plugin-scrollbar': {
            'scrollbar-width': 'thin',
          },
        })
        matchUtilities(
          {
            'plugin-size': value => ({
              width: value,
              height: value,
            }),
          },
          { values: { card: '48rpx' } },
        )
      }),
    ],
  }
}

function createV4ConfigSource() {
  return [
    'const { iconsPlugin, dynamicIconsPlugin, getIconCollections } = require("@egoist/tailwindcss-icons")',
    'const { addCleanIconSelectors, addDynamicIconSelectors, addIconSelectors } = require("@iconify/tailwind")',
    'const plugin = require("tailwindcss/plugin")',
    '',
    'module.exports = {',
    '  content: [],',
    '  theme: {',
    '    extend: {',
    '      colors: { brand: "#123456" },',
    '    },',
    '  },',
    '  plugins: [',
    '    require("@tailwindcss/forms"),',
    '    require("@tailwindcss/typography"),',
    '    require("@tailwindcss/aspect-ratio"),',
    '    require("@tailwindcss/container-queries"),',
    '    iconsPlugin({ collections: getIconCollections(["mdi", "lucide"]) }),',
    '    dynamicIconsPlugin({ prefix: "ei" }),',
    '    addCleanIconSelectors("mdi:home"),',
    '    addIconSelectors({',
    '      prefixes: [{ prefix: "mdi", icons: ["home"] }],',
    '      iconSelector: ".iconify-{prefix}-{name}",',
    '    }),',
    '    addDynamicIconSelectors(),',
    '    plugin(({ addComponents, addUtilities, matchUtilities, theme }) => {',
    '      addComponents({',
    '        ".plugin-card": { color: theme("colors.brand") },',
    '      })',
    '      addUtilities({',
    '        ".plugin-scrollbar": { "scrollbar-width": "thin" },',
    '      })',
    '      matchUtilities(',
    '        {',
    '          "plugin-size": (value) => ({',
    '            width: value,',
    '            height: value,',
    '          }),',
    '        },',
    '        { values: { card: "48rpx" } },',
    '      )',
    '    }),',
    '  ],',
    '}',
  ].join('\n')
}

async function createV4Source(root: string) {
  const configFile = path.join(root, 'tailwind.config.cjs')
  const cssEntry = path.join(root, 'app.css')
  await writeFile(configFile, createV4ConfigSource(), 'utf8')
  const css = [
    '@config "./tailwind.config.cjs";',
    '@import "tailwindcss" source(none);',
    `@source inline("${pluginCandidates.join(' ')}");`,
  ].join('\n')
  await writeFile(cssEntry, css, 'utf8')
  return resolveTailwindV4Source({
    base: root,
    css,
    projectRoot: root,
  })
}

describe('tailwindcss generator plugin compatibility', () => {
  it('supports official plugins, custom plugins, and icon plugins in the v3 engine', async () => {
    const root = await createPluginFixture(tailwindcss3Root)
    const source = await resolveTailwindV3Source({
      base: root,
      config: undefined,
      css: '@tailwind components; @tailwind utilities;',
      cwd: root,
      projectRoot: root,
    })
    source.configObject = createV3Config(root) as never
    const engine = createTailwindV3Engine(source)

    const result = await engine.generate({
      candidates: pluginCandidates,
    })
    const css = compactCss(result.css)

    expect(result.classSet).toEqual(new Set(pluginCandidates))
    expect(result.css).toContain('.form-input')
    expect(result.css).toContain('.prose')
    expect(result.css).toContain('.aspect-w-16')
    expect(result.css).toContain('.aspect-h-9')
    expect(result.css).toContain('.line-clamp-2')
    expect(result.css).toContain('.plugin-card')
    expect(result.css).toContain('color: #123456')
    expect(result.css).toContain('.plugin-scrollbar')
    expect(result.css).toContain('scrollbar-width: thin')
    expect(result.css).toContain('.plugin-size-card')
    expect(result.css).toContain('width: 48rpx')
    expect(result.css).toContain('@container')
    expect(css).toContain('text-decoration-line:underline')
    expectIconCss(result.css)
    expect(result.css).toContain('.icon--mdi')
    expect(result.css).toContain('.icon--mdi--home')
    expect(result.css).toContain('.iconify')
    expect(result.css).toContain('.iconify-mdi-home')
    expect(result.css).not.toContain('ei-\\[mdi--home\\]')
    expect(result.css).not.toContain('icon-\\[mdi--home\\]')
    expect(result.css).not.toContain('@media')
  })

  it('supports config-loaded official plugins, custom plugins, and icon plugins in the v4 engine', async () => {
    const root = await createPluginFixture(tailwindcss4Root)
    const source = await createV4Source(root)
    const engine = createTailwindV4Engine(source)

    const result = await engine.generate()
    const css = compactCss(result.css)

    expect(result.classSet).toEqual(new Set(pluginCandidates))
    expect(result.css).toContain('.form-input')
    expect(result.css).toContain('.prose')
    expect(result.css).toContain('.aspect-w-16')
    expect(result.css).toContain('.aspect-h-9')
    expect(result.css).toContain('.line-clamp-2')
    expect(result.css).toContain('.plugin-card')
    expect(result.css).toContain('color: #123456')
    expect(result.css).toContain('.plugin-scrollbar')
    expect(result.css).toContain('scrollbar-width: thin')
    expect(result.css).toContain('.plugin-size-card')
    expect(result.css).toContain('width: 48rpx')
    expect(result.css).toContain('@container')
    expect(css).toContain('text-decoration-line:underline')
    expectIconCss(result.css)
    expect(result.css).toContain('.icon--mdi')
    expect(result.css).toContain('.icon--mdi--home')
    expect(result.css).toContain('.iconify')
    expect(result.css).toContain('.iconify-mdi-home')
    expect(result.css).not.toContain('ei-\\[mdi--home\\]')
    expect(result.css).not.toContain('icon-\\[mdi--home\\]')
    expect(result.css).not.toContain('@media')
  })
})
