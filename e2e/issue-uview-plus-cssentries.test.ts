import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { ensureProjectBuilt } from './projectBuild'

const demoRoot = path.resolve(__dirname, '../demo/issue-uview-plus-cssentries')
const expectedUviewCssTokens = [
  '.u-button--primary',
  '.u-button--success',
  '.u-button--plain',
  '.u-button--hairline',
  'var(--up-primary',
  'var(--up-success',
  '.u-loading-icon__spinner',
  '.u-loading-icon__spinner--spinner',
]

interface CssAsset {
  file: string
  source: string
}

async function collectCssAssets(root: string): Promise<CssAsset[]> {
  const result: CssAsset[] = []

  async function walk(dir: string) {
    let entries: Array<import('node:fs').Dirent>
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    }
    catch (error: any) {
      if (error?.code === 'ENOENT') {
        return
      }
      throw error
    }

    for (const entry of entries) {
      const file = path.resolve(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(file)
        continue
      }
      if (!entry.isFile() || !/\.(?:wxss|acss|css)$/.test(entry.name)) {
        continue
      }
      result.push({
        file: path.relative(root, file).split(path.sep).join('/'),
        source: await fs.readFile(file, 'utf8'),
      })
    }
  }

  await walk(root)
  return result.sort((a, b) => a.file.localeCompare(b.file))
}

function collectUviewEvidence(assets: CssAsset[]) {
  const lines: string[] = []
  for (const asset of assets) {
    if (!asset.source.includes('u-button') && !asset.source.includes('u-loading-icon')) {
      continue
    }
    lines.push(`/* ${asset.file} */`)
    for (const rule of asset.source.split(/(?<=\})/)) {
      const normalized = rule.trim()
      if (
        normalized.includes('.u-button')
        || normalized.includes('.u-loading-icon')
      ) {
        lines.push(normalized)
      }
    }
  }
  return `${lines.join('\n')}\n`
}

async function buildPlatform(platform: 'mp-weixin' | 'mp-alipay') {
  const outputRoot = path.resolve(demoRoot, `dist/build/${platform}`)
  await fs.rm(outputRoot, { recursive: true, force: true })
  if (platform === 'mp-weixin') {
    await ensureProjectBuilt(demoRoot, { force: true })
  }
  else {
    const childEnv: Record<string, string | undefined> = {
      ...process.env,
      NODE_ENV: 'production',
      BROWSERSLIST_ENV: 'production',
      UNI_BUILD_STRICT: '1',
      RUST_BACKTRACE: process.env['RUST_BACKTRACE'] ?? '1',
      INIT_CWD: demoRoot,
      PNPM_PACKAGE_NAME: '@weapp-tailwindcss-demo/issue-uview-plus-cssentries',
      npm_package_json: path.resolve(demoRoot, 'package.json'),
    }
    delete childEnv['VITEST']
    for (const key of Object.keys(childEnv)) {
      if (key.startsWith('VITEST_')) {
        delete childEnv[key]
      }
    }
    await execa('pnpm', ['run', `build:${platform}`], {
      cwd: demoRoot,
      env: childEnv,
      stdio: process.env['E2E_DEBUG_BUILD'] === '1' ? 'inherit' : 'pipe',
    })
  }
  return {
    outputRoot,
    assets: await collectCssAssets(outputRoot),
  }
}

async function expectUviewCssEvidence(platform: 'mp-weixin' | 'mp-alipay') {
  const { assets } = await buildPlatform(platform)
  const css = assets.map(asset => asset.source).join('\n')

  expect(assets.map(asset => asset.file)).toContain(platform === 'mp-weixin' ? 'app.wxss' : 'app.acss')
  expect(css).toContain('.u-button')
  expect(css).toContain('var(--up-primary')
  expect(css).toContain('.u-loading-icon')
  for (const token of expectedUviewCssTokens) {
    expect(css, `${platform} should keep uview-plus compiled CSS token ${token}`).toContain(token)
  }

  const evidence = collectUviewEvidence(assets)
  expect(evidence).toContain('.u-button')
  expect(evidence).toContain('.u-loading-icon')

  const ext = platform === 'mp-weixin' ? 'wxss' : 'acss'
  const snapshotPath = path.resolve(__dirname, `__snapshots__/issue-uview-plus-cssentries/uview-css-evidence.${ext}`)
  await fs.mkdir(path.dirname(snapshotPath), { recursive: true })
  await expect(evidence).toMatchFileSnapshot(snapshotPath)
}

describe('issue-uview-plus-cssentries regression', () => {
  it('keeps uview-plus compiled wxss when cssEntries and rem2rpx are configured', async () => {
    await expectUviewCssEvidence('mp-weixin')
  }, 120_000)

  it('keeps uview-plus compiled acss when cssEntries and rem2rpx are configured', async () => {
    await expectUviewCssEvidence('mp-alipay')
  }, 120_000)
})
