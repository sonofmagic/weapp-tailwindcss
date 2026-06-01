import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import fg from 'fast-glob'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { clearProjectBuildState } from './projectTest'

const projectRoot = path.resolve(__dirname, '../demo/uni-app-vite-tailwindcss-v3')
const rawTailwindDirectiveRE = /@(tailwind|apply)\b/
const rawLayerDirectiveRE = /@layer\b/
const cssOutputPattern = '**/*.{css,wxss,acss,qss}'
const textOutputPattern = '**/*.{html,js,css,wxml,wxss}'

const platforms = [
  {
    name: 'mp-weixin',
    outputDir: 'dist/build/mp-weixin',
    appCss: 'app.wxss',
    shouldKeepWeixinVariants: true,
  },
  {
    name: 'mp-alipay',
    outputDir: 'dist/build/mp-alipay',
    appCss: 'app.acss',
  },
  {
    name: 'mp-qq',
    outputDir: 'dist/build/mp-qq',
    appCss: 'app.qss',
  },
  {
    name: 'quickapp-webview',
    outputDir: 'dist/build/quickapp-webview',
    appCss: 'app.css',
  },
] as const

async function buildPlatform(platform: string) {
  await clearProjectBuildState(projectRoot)
  await execa('pnpm', ['run', `build:${platform}`], {
    cwd: projectRoot,
    stdio: process.env.E2E_DEBUG_BUILD === '1' ? 'inherit' : 'pipe',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      BROWSERSLIST_ENV: 'production',
      UNI_BUILD_STRICT: '1',
      RUST_BACKTRACE: process.env.RUST_BACKTRACE ?? '1',
      npm_package_json: path.resolve(projectRoot, 'package.json'),
      INIT_CWD: projectRoot,
    },
  })
}

async function collectOutputCss(outputDir: string) {
  const root = path.resolve(projectRoot, outputDir)
  const files = await fg(cssOutputPattern, {
    absolute: false,
    cwd: root,
    onlyFiles: true,
  })
  const entries = await Promise.all(files.sort().map(async (file) => {
    const absolutePath = path.join(root, file)
    return {
      file,
      css: await fs.readFile(absolutePath, 'utf8'),
      bytes: (await fs.stat(absolutePath)).size,
    }
  }))
  return entries
}

async function collectOutputText(outputDir: string) {
  const root = path.resolve(projectRoot, outputDir)
  const files = await fg(textOutputPattern, {
    absolute: false,
    cwd: root,
    onlyFiles: true,
  })
  const entries = await Promise.all(files.sort().map(async (file) => {
    const absolutePath = path.join(root, file)
    return {
      file,
      text: await fs.readFile(absolutePath, 'utf8'),
    }
  }))
  return entries
}

async function readOutputFile(outputDir: string, file: string) {
  return fs.readFile(path.resolve(projectRoot, outputDir, file), 'utf8')
}

describe('uni-app vite vue3 Tailwind v3 generator output', () => {
  it('builds representative mini-program and quickapp platforms without raw Tailwind directives', async () => {
    for (const platform of platforms) {
      await buildPlatform(platform.name)
      const cssEntries = await collectOutputCss(platform.outputDir)
      const css = cssEntries.map(entry => entry.css).join('\n')
      const appCss = cssEntries.find(entry => entry.file === platform.appCss)

      expect(cssEntries.length, `${platform.name} should emit css files`).toBeGreaterThan(0)
      expect(appCss?.bytes ?? 0, `${platform.name}/${platform.appCss} should not be an unexpanded entry css`).toBeGreaterThan(5000)
      expect(css, `${platform.name} css should not keep @tailwind or @apply`).not.toMatch(rawTailwindDirectiveRE)
      expect(css, `${platform.name} css should not keep unsupported @layer wrappers`).not.toMatch(rawLayerDirectiveRE)
      expect(css, `${platform.name} should keep custom component layer rules referenced by @apply`).toMatch(/\.raw-btn\s*\{[\s\S]*?display:\s*inline-flex/)
      expect(css, `${platform.name} should keep custom component layer rules that @apply another custom class`).toMatch(/\.btn\s*\{[\s\S]*?display:\s*inline-flex/)
      expect(css, `${platform.name} should keep pseudo selectors from custom component @apply`).toMatch(/\.btn(?:::|:)after\s*\{[\s\S]*?border-style:\s*none/)
      expect(appCss?.css.indexOf('.raw-btn') ?? -1, `${platform.name} component layer should be emitted before utility classes`).toBeGreaterThanOrEqual(0)
      expect(appCss?.css.indexOf('.raw-btn') ?? Number.POSITIVE_INFINITY, `${platform.name} component layer should be emitted before utility classes`).toBeLessThan(appCss?.css.indexOf('.flex') ?? -1)
      expect(css, `${platform.name} should keep arbitrary color utilities`).toMatch(/(?:\.bg-_b_h123456_B|background-color:\s*#123456)/)
      expect(css, `${platform.name} should keep after variant utilities`).toMatch(/after_c(?:content|border-none)|--tw-content|content:/)
      expect(css, `${platform.name} should keep arbitrary group variant utilities`).toMatch(/group-_b_published_B_ctext-green-500|published/)
      expect(css, `${platform.name} should keep iconify generated css`).toMatch(/\.i-mdi-home|mask-image|--svg/)

      if (platform.shouldKeepWeixinVariants) {
        expect(css, `${platform.name} should keep css-macro ifdef variant`).toMatch(/ifdef-_bMP-WEIXIN_B_cbg-blue-500|bg-blue-500/)
        expect(css, `${platform.name} should keep custom wx variant`).toMatch(/wx_cbg-blue-400|bg-blue-400/)
      }
    }
  }, 1_200_000)

  it('emits platform-specific css-macro comments for mp-weixin and H5 builds', async () => {
    await buildPlatform('mp-weixin')

    const mpWxml = await readOutputFile('dist/build/mp-weixin', 'pages/index/index.wxml')
    const mpCss = (await collectOutputCss('dist/build/mp-weixin')).map(entry => entry.css).join('\n')

    expect(mpWxml, 'mp-weixin should keep the mini-program DOM branch').toContain('css-macro-e2e-mp')
    expect(mpWxml, 'mp-weixin should keep the mini-program DOM text').toContain('css-macro-mp')
    expect(mpWxml, 'mp-weixin should remove the H5 DOM branch').not.toContain('css-macro-e2e-h5')
    expect(mpWxml, 'mp-weixin should remove the H5 DOM text').not.toContain('css-macro-h5')
    expect(mpCss, 'css-macro should not leave legacy platform media queries').not.toContain('@media (weapp-tw-platform')
    expect(mpCss, 'mp-weixin should keep matching css-macro ifdef branch').toMatch(
      /\.ifdef-_bMP-WEIXIN_B_cbg-_b_h1167ff_B \{[\s\S]*?background-color:\s*rgba\(17,\s*103,\s*255,/,
    )
    expect(mpCss, 'mp-weixin should keep matching css-macro ifndef branch').toMatch(
      /\.ifndef-_bH5_B_ctext-_b_h0055aa_B \{[\s\S]*?color:\s*rgba\(0,\s*85,\s*170,/,
    )
    expect(mpCss, 'mp-weixin should remove non-matching css-macro ifndef branch before final css output').not.toContain('.ifndef-_bMP-WEIXIN_B_cbg-red-500')
    expect(mpCss, 'mp-weixin should remove non-matching css-macro H5 ifdef branch before final css output').not.toContain('.ifdef-_bH5_B_cbg-_b_hff6611_B')
    expect(mpCss, 'mp-weixin should not leave css-macro conditional comments in final css output').not.toContain('#ifdef MP-WEIXIN')
    expect(mpCss, 'mp-weixin should not leave css-macro negative conditional comments in final css output').not.toContain('#ifndef MP-WEIXIN')

    await buildPlatform('h5')

    const h5Output = (await collectOutputText('dist/build/h5')).map(entry => entry.text).join('\n')

    expect(h5Output, 'H5 should keep the H5 DOM branch').toContain('css-macro-e2e-h5')
    expect(h5Output, 'H5 should keep the H5 DOM text').toContain('css-macro-h5')
    expect(h5Output, 'H5 should remove the mini-program DOM branch').not.toContain('css-macro-e2e-mp')
    expect(h5Output, 'H5 should remove the mini-program DOM text').not.toContain('css-macro-mp')
    expect(h5Output, 'css-macro should not leave legacy platform media queries in H5 output').not.toContain('@media (weapp-tw-platform')
    expect(h5Output, 'css-macro should expand internal conditional at-rules in H5 output').not.toContain('@weapp-tw-ifdef')
    expect(h5Output, 'css-macro should expand internal negative conditional at-rules in H5 output').not.toContain('@weapp-tw-ifndef')
    expect(h5Output, 'H5 should keep matching css-macro ifdef branch').toMatch(
      /\.ifdef-\\\[H5\\\]\\:bg-\\\[\\#ff6611\\\] \{[\s\S]*?background-color:\s*rgb\(255\s+102\s+17\s+\//,
    )
    expect(h5Output, 'H5 should keep matching css-macro ifndef branch').toMatch(
      /\.ifndef-\\\[MP-WEIXIN\\\]\\:text-\\\[\\#aa3300\\\] \{[\s\S]*?color:\s*rgb\(170\s+51\s+0\s+\//,
    )
    expect(h5Output, 'H5 should remove non-matching css-macro MP-WEIXIN ifdef branch before final css output').not.toContain('.ifdef-\\[MP-WEIXIN\\]\\:bg-blue-500')
    expect(h5Output, 'H5 should remove non-matching css-macro MP-WEIXIN ifdef branch before final css output').not.toContain('.ifdef-_bMP-WEIXIN_B_cbg-blue-500')
    expect(h5Output, 'H5 should not leave css-macro conditional comments in final css output').not.toContain('#ifdef H5')
    expect(h5Output, 'H5 should not leave css-macro negative conditional comments in final css output').not.toContain('#ifndef MP-WEIXIN')
  }, 600_000)
})
