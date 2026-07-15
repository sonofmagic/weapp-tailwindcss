import fs from 'node:fs/promises'
import process from 'node:process'
import { Launcher } from '@weapp-vite/miniprogram-automator'
import { execa } from 'execa'
import path from 'pathe'
import { PNG } from 'pngjs'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { collectFrameworkIdeDiagnostics } from './frameworkIdeDiagnostics'

const describeIde = process.env['E2E_IDE'] === '1' ? describe : describe.skip
const timeoutMs = Number(process.env['E2E_IDE_ROOT_SELECTOR_TIMEOUT_MS'] ?? process.env['E2E_AUTOMATOR_TIMEOUT_MS'] ?? 90_000)
const launchAttemptTimeoutMs = Number(process.env['E2E_IDE_ROOT_SELECTOR_LAUNCH_ATTEMPT_TIMEOUT_MS'] ?? 45_000)
const closeTimeoutMs = Number(process.env['E2E_IDE_CLOSE_TIMEOUT_MS'] ?? 5000)
const projectName = 'root-selector-miniprogram'
const projectPath = path.resolve(__dirname, 'fixtures', projectName)
const artifactDir = path.resolve(__dirname, '.artifacts/root-selector')
const pageUrl = '/pages/index/index'
const positivePixelThreshold = 1000
const negativePixelThreshold = 1000

type ColorMatcher = (red: number, green: number, blue: number, alpha: number) => boolean

const probeMatchers = {
  groupWithRoot: (red, green, blue, alpha) => alpha > 200 && red > 160 && green < 100 && blue >= 80 && blue < 180,
  groupWithoutRoot: (red, green, blue, alpha) => alpha > 200 && red < 80 && green > 100 && blue > 120,
  hostGlobal: (red, green, blue, alpha) => alpha > 200 && red > 150 && green >= 70 && green < 160 && blue < 80,
  hostLocal: (red, green, blue, alpha) => alpha > 200 && red >= 40 && red < 140 && green > 110 && blue < 80,
  page: (red, green, blue, alpha) => alpha > 200 && red < 80 && green > 100 && blue >= 60 && blue < 120,
  portal: (red, green, blue, alpha) => alpha > 200 && red >= 80 && red < 180 && green < 100 && blue > 180,
  root: (red, green, blue, alpha) => alpha > 200 && red > 150 && green < 100 && blue < 100,
  twRoot: (red, green, blue, alpha) => alpha > 200 && red < 100 && green < 110 && blue > 150,
} satisfies Record<string, ColorMatcher>

const wait = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout))

async function cleanupDevTools() {
  if (process.platform !== 'darwin') {
    return
  }
  await execa('osascript', ['-e', 'quit app "wechatwebdevtools"'], {
    reject: false,
    timeout: closeTimeoutMs,
  }).catch(() => undefined)
  await execa('pkill', ['-f', '/Applications/wechatwebdevtools.app'], {
    reject: false,
  }).catch(() => undefined)
  await execa('pkill', ['-f', 'wechatwebdevtools Daemon'], {
    reject: false,
  }).catch(() => undefined)
  await wait(800)
}

function withTimeout<T>(promise: Promise<T>, timeout: number, label: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out in ${timeout}ms`)), timeout)
    promise.then(resolve, reject).finally(() => clearTimeout(timer))
  })
}

async function launchMiniProgram() {
  let lastError: unknown
  for (let attempt = 1; attempt <= 2; attempt++) {
    await cleanupDevTools()
    const automator = new Launcher()
    try {
      return await withTimeout(
        automator.launch({
          projectPath,
          timeout: timeoutMs,
        }),
        launchAttemptTimeoutMs,
        `root selector DevTools launch attempt ${attempt}`,
      )
    }
    catch (error) {
      lastError = error
      await cleanupDevTools()
    }
  }
  if (lastError instanceof Error) {
    lastError.message = `${lastError.message}\n${await collectFrameworkIdeDiagnostics(projectName)}`
  }
  throw lastError
}

async function captureMiniProgramScreenshot(miniProgram: any, screenshotPath: string) {
  await fs.mkdir(path.dirname(screenshotPath), { recursive: true })
  const result = await miniProgram.send('App.captureScreenshot', {}, {
    timeout: Math.min(timeoutMs, 30_000),
  })
  expect(typeof result?.data).toBe('string')
  await fs.writeFile(screenshotPath, result.data, 'base64')
  return PNG.sync.read(await fs.readFile(screenshotPath))
}

function countColorPixels(png: PNG, matcher: ColorMatcher) {
  let pixels = 0
  for (let index = 0; index < png.data.length; index += 4) {
    const red = png.data[index] ?? 0
    const green = png.data[index + 1] ?? 0
    const blue = png.data[index + 2] ?? 0
    const alpha = png.data[index + 3] ?? 0
    if (matcher(red, green, blue, alpha)) {
      pixels++
    }
  }
  return pixels
}

async function writeEvidence(evidence: unknown) {
  await fs.mkdir(artifactDir, { recursive: true })
  await fs.writeFile(
    path.resolve(artifactDir, 'root-selector-evidence.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
  )
}

describeIde.sequential('root selector IDE runtime', () => {
  let miniProgram: any

  beforeAll(async () => {
    miniProgram = await launchMiniProgram()
  }, launchAttemptTimeoutMs * 2 + 30_000)

  afterAll(async () => {
    await miniProgram?.close().catch(() => undefined)
    await cleanupDevTools()
  }, closeTimeoutMs + 10_000)

  it('verifies root selectors through inherited CSS variables in WeChat DevTools', async () => {
    const page = await miniProgram.reLaunch(pageUrl)
    await page.waitFor(1000)

    const screenshotPath = path.resolve(artifactDir, 'root-selector.png')
    const screenshot = await captureMiniProgramScreenshot(miniProgram, screenshotPath)
    const pixels = Object.fromEntries(
      Object.entries(probeMatchers).map(([name, matcher]) => [name, countColorPixels(screenshot, matcher)]),
    )
    const evidence = {
      pageUrl,
      pixels,
      screenshot: screenshotPath,
    }
    await writeEvidence(evidence)

    expect(pixels.root, `app.wxss 中的 :root 不应匹配小程序根节点: ${JSON.stringify(evidence)}`).toBeLessThan(negativePixelThreshold)
    expect(pixels.hostGlobal, `app.wxss 中的 :host 不应匹配组件 host: ${JSON.stringify(evidence)}`).toBeLessThan(negativePixelThreshold)
    expect(pixels.hostLocal, `组件 wxss 中的 :host 应提供可继承变量: ${JSON.stringify(evidence)}`).toBeGreaterThan(positivePixelThreshold)
    expect(pixels.page, `page 应提供可继承变量: ${JSON.stringify(evidence)}`).toBeGreaterThan(positivePixelThreshold)
    expect(pixels.twRoot, `.tw-root 应提供可继承变量: ${JSON.stringify(evidence)}`).toBeGreaterThan(positivePixelThreshold)
    expect(pixels.portal, `wx-root-portal-content 应提供可继承变量: ${JSON.stringify(evidence)}`).toBeGreaterThan(positivePixelThreshold)
    expect(pixels.groupWithRoot, `包含 :root 的完整选择器组不应整体失效: ${JSON.stringify(evidence)}`).toBeGreaterThan(positivePixelThreshold)
    expect(pixels.groupWithoutRoot, `不包含 :root 的根选择器组应生效: ${JSON.stringify(evidence)}`).toBeGreaterThan(positivePixelThreshold)
  }, 120_000)
})
