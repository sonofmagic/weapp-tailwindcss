import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import fg from 'fast-glob'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { clearProjectBuildState } from './projectTest'

const projectRoot = path.resolve(__dirname, '../demo/uni-app-vue3-vite')
const rawTailwindDirectiveRE = /@(tailwind|apply)\b/
const cssOutputPattern = '**/*.{css,wxss,acss,qss}'

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
})
