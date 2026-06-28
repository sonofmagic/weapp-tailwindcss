import fs from 'node:fs/promises'
import process from 'node:process'
import { Launcher } from '@weapp-vite/miniprogram-automator'
import { execa } from 'execa'
import path from 'pathe'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { collectFrameworkIdeDiagnostics } from './frameworkIdeDiagnostics'
import { ensureProjectBuilt } from './projectBuild'

const describeIde = process.env['E2E_IDE'] === '1' ? describe : describe.skip
const v4ProjectRoot = path.resolve(__dirname, '../demo/taro-webpack-react-tailwindcss-v4')
const v4ProjectPath = v4ProjectRoot
const v4AppWxssPath = path.resolve(v4ProjectRoot, 'dist/app.wxss')
const v3ProjectRoot = path.resolve(__dirname, '../demo/taro-webpack-react-tailwindcss-v4')
const v3ProjectPath = v3ProjectRoot
const v3AppWxssPath = path.resolve(v3ProjectRoot, 'dist/app.wxss')
const issue909PageUrl = '/pages/issue-909/index'
const issue928PageUrl = '/pages/issue-928/index'
const timeoutMs = Number(process.env['E2E_IDE_ISSUE_909_TIMEOUT_MS'] ?? process.env['E2E_AUTOMATOR_TIMEOUT_MS'] ?? 90_000)
const artifactDir = path.resolve(__dirname, '.artifacts/issue-909')
const issue928BaselineDir = path.resolve(__dirname, 'fixtures/issue-928-baselines')
const isTailwindcssV4GradientFallbackEnabled = process.env['WEAPP_TW_V4_GRADIENT_FALLBACK'] === '1'
const shouldUpdateIssue928CompareBaseline = process.env['E2E_UPDATE_ISSUE_928_BASELINE'] === '1'
const transformClasses = [
  'rotate-y-90',
  'rotate-y-45',
  '-rotate-y-45',
  'rotate-x-45',
  'rotate-z-45',
]
const gradientClasses = [
  'bg-linear-to-r',
  'bg-linear-to-tr',
  'bg-linear-65',
  'bg-radial',
  'bg-conic',
  'bg-conic-180',
  'from-cyan-500',
  'via-purple-500',
  'to-blue-500',
]
const coveredIssues = [
  '#909 Tailwind v4 transform variable fallbacks',
  '#916 native mini-program tag selector preservation',
  '#928 Tailwind v4 gradient stop fallbacks',
]

interface Issue928ProbeOptions {
  artifactPrefix: string
  coveredIssue: string
  expectedPrimaryClass: string
  expectedViaClass: string
  gradientSelector: string
  viaSelector: string
  stopSelector: string
  radialSelector: string
  conicSelector: string
  arbitraryImageSelector: string
  compareBaselinePath?: string
  extraVisualAssertions?: (context: {
    screenshot: PNG
    scaleX: number
    scaleY: number
    page: any
  }) => Promise<Record<string, unknown>>
}

interface Rect {
  left: number
  top: number
  width: number
  height: number
}

async function captureMiniProgramScreenshot(miniProgram: any, screenshotPath: string) {
  await fs.mkdir(path.dirname(screenshotPath), { recursive: true })
  const result = await miniProgram.send('App.captureScreenshot', {}, {
    timeout: timeoutMs,
  })
  expect(typeof result?.data).toBe('string')
  await fs.writeFile(screenshotPath, result.data, 'base64')
}

async function readScreenshot(screenshotPath: string) {
  return PNG.sync.read(await fs.readFile(screenshotPath))
}

function expandRect(rect: Rect, padding: number): Rect {
  return {
    left: rect.left - padding,
    top: rect.top - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  }
}

function scaleRect(rect: Rect, scaleX: number, scaleY: number): Rect {
  return {
    left: rect.left * scaleX,
    top: rect.top * scaleY,
    width: rect.width * scaleX,
    height: rect.height * scaleY,
  }
}

function countEmeraldPixels(png: PNG, rect: Rect) {
  return countPixels(png, rect, ({ alpha, blue, green, red }) => {
    return alpha > 180 && green > 130 && green > red + 30 && green > blue + 20
  })
}

function countAmberPixels(png: PNG, rect: Rect) {
  return countPixels(png, rect, ({ alpha, blue, green, red }) => {
    return alpha > 180 && red > 180 && green > 120 && blue < 80
  })
}

function countBluePixels(png: PNG, rect: Rect) {
  return countPixels(png, rect, ({ alpha, blue, red }) => {
    return alpha > 180 && blue > 120 && blue > red + 30
  })
}

function countCyanPixels(png: PNG, rect: Rect) {
  return countPixels(png, rect, ({ alpha, blue, green, red }) => {
    return alpha > 180 && green > 130 && blue > 130 && green > red + 35
  })
}

function countPurplePixels(png: PNG, rect: Rect) {
  return countPixels(png, rect, ({ alpha, blue, green, red }) => {
    return alpha > 180 && red > 120 && blue > 120 && blue > green + 30
  })
}

function countRedPixels(png: PNG, rect: Rect) {
  return countPixels(png, rect, ({ alpha, blue, green, red }) => {
    return alpha > 180 && red > 150 && red > green + 40 && red > blue + 30
  })
}

function countYellowPixels(png: PNG, rect: Rect) {
  return countPixels(png, rect, ({ alpha, blue, green, red }) => {
    return alpha > 180 && red > 180 && green > 150 && blue < 130
  })
}

function countPixels(
  png: PNG,
  rect: Rect,
  predicate: (color: { alpha: number, blue: number, green: number, red: number }) => boolean,
) {
  const left = Math.max(0, Math.floor(rect.left))
  const top = Math.max(0, Math.floor(rect.top))
  const right = Math.min(png.width, Math.ceil(rect.left + rect.width))
  const bottom = Math.min(png.height, Math.ceil(rect.top + rect.height))
  let pixels = 0

  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const index = (png.width * y + x) * 4
      const red = png.data[index]!
      const green = png.data[index + 1]!
      const blue = png.data[index + 2]!
      const alpha = png.data[index + 3]!

      if (predicate({ alpha, blue, green, red })) {
        pixels++
      }
    }
  }

  return pixels
}

function cropPng(source: PNG, rect: Rect) {
  const left = Math.max(0, Math.floor(rect.left))
  const top = Math.max(0, Math.floor(rect.top))
  const right = Math.min(source.width, Math.ceil(rect.left + rect.width))
  const bottom = Math.min(source.height, Math.ceil(rect.top + rect.height))
  const width = Math.max(0, right - left)
  const height = Math.max(0, bottom - top)
  const cropped = new PNG({ width, height })

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sourceIndex = (source.width * (top + y) + (left + x)) * 4
      const targetIndex = (width * y + x) * 4
      cropped.data[targetIndex] = source.data[sourceIndex] ?? 0
      cropped.data[targetIndex + 1] = source.data[sourceIndex + 1] ?? 0
      cropped.data[targetIndex + 2] = source.data[sourceIndex + 2] ?? 0
      cropped.data[targetIndex + 3] = source.data[sourceIndex + 3] ?? 0
    }
  }

  return cropped
}

function unionRect(...rects: Rect[]) {
  const left = Math.min(...rects.map(rect => rect.left))
  const top = Math.min(...rects.map(rect => rect.top))
  const right = Math.max(...rects.map(rect => rect.left + rect.width))
  const bottom = Math.max(...rects.map(rect => rect.top + rect.height))
  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  }
}

function toCssSelector(className: string) {
  return new RegExp(`\\.${className.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*\\{`)
}

const wait = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout))

async function cleanupDevTools() {
  if (process.platform !== 'darwin') {
    return
  }
  const timeout = Number(process.env['E2E_IDE_CLEANUP_TIMEOUT_MS'] ?? 5000)
  await execa('osascript', ['-e', 'quit app "wechatwebdevtools"'], {
    reject: false,
    timeout,
  }).catch(() => undefined)
  await execa('pkill', ['-f', '/Applications/wechatwebdevtools.app'], {
    reject: false,
  }).catch(() => undefined)
  await execa('pkill', ['-f', 'wechatwebdevtools Daemon'], {
    reject: false,
  }).catch(() => undefined)
  await wait(800)
}

async function collectScaledRect(page: any, screenshot: PNG, node: any, padding = 2) {
  const pageSize = await page.size()
  const scaleX = screenshot.width / pageSize.width
  const scaleY = screenshot.height / pageSize.height
  return {
    rect: expandRect(scaleRect({ ...await node.offset(), ...await node.size() }, scaleX, scaleY), padding),
    scaleX,
    scaleY,
  }
}

async function assertIssue928GradientRuntime(miniProgram: any, options: Issue928ProbeOptions) {
  const gradientPage = await miniProgram.reLaunch(issue928PageUrl)
  await gradientPage.waitFor(1000)

  const gradientNode = await gradientPage.$(options.gradientSelector)
  const viaGradientNode = await gradientPage.$(options.viaSelector)
  const stopArbitraryGradientNode = await gradientPage.$(options.stopSelector)
  const radialGradientNode = await gradientPage.$(options.radialSelector)
  const conicGradientNode = await gradientPage.$(options.conicSelector)
  const arbitraryImageGradientNode = await gradientPage.$(options.arbitraryImageSelector)

  expect(gradientNode).toBeTruthy()
  expect(viaGradientNode).toBeTruthy()
  expect(stopArbitraryGradientNode).toBeTruthy()
  expect(radialGradientNode).toBeTruthy()
  expect(conicGradientNode).toBeTruthy()
  expect(arbitraryImageGradientNode).toBeTruthy()
  await expect(gradientNode.attribute('class')).resolves.toContain(options.expectedPrimaryClass)
  await expect(viaGradientNode.attribute('class')).resolves.toContain(options.expectedViaClass)
  await expect(stopArbitraryGradientNode.attribute('class')).resolves.toContain('from-')

  const gradientScreenshotPath = path.resolve(artifactDir, `${options.artifactPrefix}-issue-928-gradient.png`)
  await captureMiniProgramScreenshot(miniProgram, gradientScreenshotPath)
  const gradientScreenshot = await readScreenshot(gradientScreenshotPath)
  const { rect: gradientRect, scaleX, scaleY } = await collectScaledRect(gradientPage, gradientScreenshot, gradientNode)
  const { rect: viaGradientRect } = await collectScaledRect(gradientPage, gradientScreenshot, viaGradientNode)
  const { rect: stopArbitraryGradientRect } = await collectScaledRect(gradientPage, gradientScreenshot, stopArbitraryGradientNode)
  const { rect: radialGradientRect } = await collectScaledRect(gradientPage, gradientScreenshot, radialGradientNode)
  const { rect: conicGradientRect } = await collectScaledRect(gradientPage, gradientScreenshot, conicGradientNode)
  const { rect: arbitraryImageGradientRect } = await collectScaledRect(gradientPage, gradientScreenshot, arbitraryImageGradientNode)
  const gradientBluePixels = countBluePixels(gradientScreenshot, gradientRect)
  const gradientCyanPixels = countCyanPixels(gradientScreenshot, gradientRect)
  const viaGradientPurplePixels = countPurplePixels(gradientScreenshot, viaGradientRect)
  const stopArbitraryGradientBluePixels = countBluePixels(gradientScreenshot, stopArbitraryGradientRect)
  const stopArbitraryGradientCyanPixels = countCyanPixels(gradientScreenshot, stopArbitraryGradientRect)
  const stopArbitraryGradientPurplePixels = countPurplePixels(gradientScreenshot, stopArbitraryGradientRect)
  const radialGradientPurplePixels = countPurplePixels(gradientScreenshot, radialGradientRect)
  const conicGradientPurplePixels = countPurplePixels(gradientScreenshot, conicGradientRect)
  const arbitraryImageGradientBluePixels = countBluePixels(gradientScreenshot, arbitraryImageGradientRect)
  const compareRect = unionRect(gradientRect, viaGradientRect, stopArbitraryGradientRect)
  const comparePng = cropPng(gradientScreenshot, compareRect)
  const comparePath = path.resolve(artifactDir, `${options.artifactPrefix}-issue-928-compare.png`)
  await fs.writeFile(comparePath, PNG.sync.write(comparePng))
  let compareBaselineInitialized = false
  let compareBaselineUpdated = false
  let compareDiffPath: string | undefined
  let compareDifferentPixels: number | undefined
  let compareRatio: number | undefined
  if (options.compareBaselinePath) {
    const shouldWriteBaseline = shouldUpdateIssue928CompareBaseline
      || await fs.access(options.compareBaselinePath).then(() => false, () => true)
    if (shouldWriteBaseline) {
      await fs.mkdir(path.dirname(options.compareBaselinePath), { recursive: true })
      await fs.writeFile(options.compareBaselinePath, PNG.sync.write(comparePng))
      compareBaselineInitialized = !shouldUpdateIssue928CompareBaseline
      compareBaselineUpdated = shouldUpdateIssue928CompareBaseline
    }
    const baselinePng = PNG.sync.read(await fs.readFile(options.compareBaselinePath))
    expect(Math.abs(baselinePng.width - comparePng.width)).toBeLessThanOrEqual(1)
    expect(Math.abs(baselinePng.height - comparePng.height)).toBeLessThanOrEqual(1)
    const stableCompareWidth = Math.min(comparePng.width, baselinePng.width)
    const stableCompareHeight = Math.min(comparePng.height, baselinePng.height)
    const stableComparePng = cropPng(comparePng, {
      height: stableCompareHeight,
      left: 0,
      top: 0,
      width: stableCompareWidth,
    })
    const stableBaselinePng = cropPng(baselinePng, {
      height: stableCompareHeight,
      left: 0,
      top: 0,
      width: stableCompareWidth,
    })
    const diffPng = new PNG({ width: stableCompareWidth, height: stableCompareHeight })
    compareDifferentPixels = pixelmatch(stableComparePng.data, stableBaselinePng.data, diffPng.data, stableCompareWidth, stableCompareHeight, {
      threshold: 0.1,
    })
    compareDiffPath = path.resolve(artifactDir, `${options.artifactPrefix}-issue-928-compare-diff.png`)
    await fs.writeFile(compareDiffPath, PNG.sync.write(diffPng))
    compareRatio = Math.round((compareDifferentPixels / (stableCompareWidth * stableCompareHeight)) * 10000) / 10000
  }
  const extraVisual = await options.extraVisualAssertions?.({
    page: gradientPage,
    scaleX,
    scaleY,
    screenshot: gradientScreenshot,
  }) ?? {}

  await fs.writeFile(
    path.resolve(artifactDir, `${options.artifactPrefix}-issue-928-gradient-visual.json`),
    `${JSON.stringify({
      arbitraryImageGradientBluePixels,
      arbitraryImageGradientRect,
      conicGradientPurplePixels,
      conicGradientRect,
      coveredIssues: [options.coveredIssue],
      gradientBluePixels,
      gradientCyanPixels,
      gradientRect,
      compareDiffPath,
      compareBaselineInitialized,
      compareBaselinePath: options.compareBaselinePath,
      compareBaselineUpdated,
      compareDifferentPixels,
      comparePath,
      compareRatio,
      radialGradientPurplePixels,
      radialGradientRect,
      scaleX,
      scaleY,
      screenshot: gradientScreenshotPath,
      stopArbitraryGradientBluePixels,
      stopArbitraryGradientCyanPixels,
      stopArbitraryGradientPurplePixels,
      stopArbitraryGradientRect,
      viaGradientPurplePixels,
      viaGradientRect,
      ...extraVisual,
    }, null, 2)}\n`,
  )

  expect(gradientCyanPixels).toBeGreaterThan(100)
  expect(gradientBluePixels).toBeGreaterThan(100)
  expect(viaGradientPurplePixels).toBeGreaterThan(100)
  expect(stopArbitraryGradientCyanPixels).toBeGreaterThan(100)
  expect(stopArbitraryGradientBluePixels).toBeGreaterThan(100)
  if (options.compareBaselinePath) {
    expect(compareDifferentPixels).toBeLessThan(10)
  }
}

describeIde.sequential('issues 909/916/928 IDE runtime', () => {
  let miniProgram: any

  beforeAll(async () => {
    if (process.env['E2E_SKIP_BUILD'] !== '1') {
      await ensureProjectBuilt(v4ProjectRoot)
    }
    await cleanupDevTools()
    try {
      const automator = new Launcher()
      miniProgram = await automator.launch({
        projectPath: v4ProjectPath,
        timeout: timeoutMs,
      })
    }
    catch (error) {
      if (error instanceof Error) {
        error.message = `${error.message}\n${await collectFrameworkIdeDiagnostics('issue-909')}`
      }
      throw error
    }
  }, 180_000)

  afterAll(async () => {
    await miniProgram?.close()
    await cleanupDevTools()
  })

  it('keeps Tailwind v4 transform, native selector and gradient utilities valid in WeChat DevTools', async () => {
    const appWxss = await fs.readFile(v4AppWxssPath, 'utf8')
    for (const className of transformClasses) {
      expect(appWxss).toMatch(toCssSelector(className))
    }
    for (const className of gradientClasses) {
      expect(appWxss).toMatch(toCssSelector(className))
    }
    expect(appWxss).toMatch(/transform:\s*var\(--tw-rotate-x, \) var\(--tw-rotate-y, \) var\(--tw-rotate-z, \) var\(--tw-skew-x, \) var\(--tw-skew-y, \)/)
    expect(appWxss).not.toMatch(/transform:\s*var\(--tw-rotate-x,\) var\(--tw-rotate-y,\)/)
    expect(appWxss).toMatch(/view,text,::after,::before\s*\{\s*border:0 solid;\s*box-sizing:border-box;\s*margin:0;\s*padding:0\s*\}/)
    expect(appWxss).toMatch(/background-image:\s*linear-gradient\(var\(--tw-gradient-stops\)\)/)
    expect(appWxss).toMatch(/\.bg-linear-to-r\s*\{\s*--tw-gradient-position:\s*to right;\s*background-image:\s*-webkit-linear-gradient\(var\(--tw-gradient-stops\)\);\s*background-image:\s*linear-gradient\(var\(--tw-gradient-stops\)\)/)
    if (isTailwindcssV4GradientFallbackEnabled) {
      expect(appWxss).toContain('.bg-linear-to-r.from-cyan-500.to-blue-500')
      expect(appWxss).toContain('background-image: linear-gradient(to right, #06b6d4, #3b82f6)')
      expect(appWxss).toContain('background-image: linear-gradient(to right, #06b6d4, #a855f7, #3b82f6)')
      expect(appWxss).toContain('background-image: linear-gradient(to right, var(--issue-928-from), var(--issue-928-via), var(--issue-928-to))')
      expect(appWxss).toContain('background-image: linear-gradient(to top right, #06b6d4 10%, #a855f7 30%, #3b82f6 90%)')
      expect(appWxss).toContain('background-image: linear-gradient(65deg, #34d399, #fde047, #f43f5e)')
      expect(appWxss).toContain('background-image: radial-gradient(#06b6d4, #a855f7, #3b82f6)')
      expect(appWxss).toContain('background-image: radial-gradient(at 50% 75%, #06b6d4, #a855f7, #3b82f6)')
      expect(appWxss).toContain('background-image: conic-gradient(#06b6d4, #a855f7, #3b82f6)')
      expect(appWxss).toContain('background-image: conic-gradient(from 180deg, #06b6d4, #a855f7, #3b82f6)')
      expect(appWxss).toContain('background-image: conic-gradient(from -180deg, #06b6d4, #a855f7, #3b82f6)')
      expect(appWxss).toContain('background-image: linear-gradient(25deg,#ef4444 5%,#eab308 60%,#22c55e 90%,#14b8a6)')
      expect(appWxss).toContain('background-image: conic-gradient(from 45deg at 50% 50%,#ef4444,#eab308,#22c55e)')
    }
    else {
      expect(appWxss).not.toContain('.bg-linear-to-r.from-cyan-500.to-blue-500')
      expect(appWxss).not.toContain('background-image: linear-gradient(to right, #06b6d4, #3b82f6)')
      expect(appWxss).not.toContain('background-image: linear-gradient(to right, #06b6d4, #a855f7, #3b82f6)')
      expect(appWxss).not.toContain('background-image: radial-gradient(#06b6d4, #a855f7, #3b82f6)')
      expect(appWxss).not.toContain('background-image: conic-gradient(#06b6d4, #a855f7, #3b82f6)')
      expect(appWxss).toContain('background-image:linear-gradient(var(--tw-gradient-stops,25deg,#ef4444 5%,#eab308 60%,#22c55e 90%,#14b8a6))')
      expect(appWxss).toContain('background-image:conic-gradient(var(--tw-gradient-stops,from 45deg at 50% 50%,#ef4444,#eab308,#22c55e))')
    }
    expect(appWxss).toContain('background-image:linear-gradient(90deg,#06b6d4,#3b82f6)')
    expect(appWxss, 'issue 928 should keep mini-program parseable gradient via fallback')
      .toContain('--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position)),')
    expect(appWxss, 'issue 928 should keep from-position comma-space fallback in gradient stops')
      .toContain('var(--tw-gradient-from) var(--tw-gradient-from-position, )')
    expect(appWxss, 'issue 928 should keep to-position comma-space fallback in gradient stops')
      .toContain('var(--tw-gradient-to) var(--tw-gradient-to-position, )')
    expect(appWxss).not.toContain('var(--tw-gradient-from-position,),')
    expect(appWxss).not.toContain('var(--tw-gradient-to-position,),')
    expect(appWxss).not.toContain('var(--tw-gradient-from-position),')
    expect(appWxss).not.toContain('var(--tw-gradient-to-position);')
    expect(appWxss).not.toContain('--tw-gradient-via-stops: initial')
    expect(appWxss).not.toContain('to right in oklab')
    expect(appWxss).not.toContain('var(--tw-gradient-via-stops, var(--tw-gradient-position),')

    const page = await miniProgram.reLaunch(issue909PageUrl)
    await page.waitFor(1000)
    const controlNode = await page.$('.issue-909-box-control')
    const rotateNode = await page.$('.issue-909-box-rotate-y-90')
    const rotateY45Node = await page.$('.issue-909-box-rotate-y-45')
    const negativeRotateY45Node = await page.$('.issue-909-box-negative-rotate-y-45')
    const rotateX45Node = await page.$('.issue-909-box-rotate-x-45')
    const rotateZ45Node = await page.$('.issue-909-box-rotate-z-45')
    const nativeSelectorNode = await page.$('.issue-916-native-selector-box')
    expect(controlNode).toBeTruthy()
    expect(rotateNode).toBeTruthy()
    expect(rotateY45Node).toBeTruthy()
    expect(negativeRotateY45Node).toBeTruthy()
    expect(rotateX45Node).toBeTruthy()
    expect(rotateZ45Node).toBeTruthy()
    expect(nativeSelectorNode).toBeTruthy()

    const className = await rotateNode.attribute('class')
    expect(className).toContain('rotate-y-90')
    await expect(rotateY45Node.attribute('class')).resolves.toContain('rotate-y-45')
    await expect(negativeRotateY45Node.attribute('class')).resolves.toContain('-rotate-y-45')
    await expect(rotateX45Node.attribute('class')).resolves.toContain('rotate-x-45')
    await expect(rotateZ45Node.attribute('class')).resolves.toContain('rotate-z-45')

    const nativeSelectorSize = await nativeSelectorNode.size()
    expect(Math.round(nativeSelectorSize.width)).toBe(80)
    expect(Math.round(nativeSelectorSize.height)).toBe(80)

    const screenshotPath = path.resolve(artifactDir, 'issues-909-916.png')
    await captureMiniProgramScreenshot(miniProgram, screenshotPath)
    const screenshot = await readScreenshot(screenshotPath)
    const pageSize = await page.size()
    const controlOffset = await controlNode.offset()
    const controlSize = await controlNode.size()
    const rotateOffset = await rotateNode.offset()
    const rotateSize = await rotateNode.size()
    const nativeSelectorOffset = await nativeSelectorNode.offset()
    const scaleX = screenshot.width / pageSize.width
    const scaleY = screenshot.height / pageSize.height
    const controlRect = expandRect(scaleRect({ ...controlOffset, ...controlSize }, scaleX, scaleY), 4)
    const rotateRect = expandRect(scaleRect({ ...rotateOffset, ...rotateSize }, scaleX, scaleY), 4)
    const nativeSelectorRect = expandRect(scaleRect({ ...nativeSelectorOffset, ...nativeSelectorSize }, scaleX, scaleY), 4)
    const controlEmeraldPixels = countEmeraldPixels(screenshot, controlRect)
    const rotateEmeraldPixels = countEmeraldPixels(screenshot, rotateRect)
    const nativeSelectorAmberPixels = countAmberPixels(screenshot, nativeSelectorRect)
    const visibleRatio = rotateEmeraldPixels / Math.max(controlEmeraldPixels, 1)

    await fs.writeFile(
      path.resolve(artifactDir, 'issues-909-916-visual.json'),
      `${JSON.stringify({
        className,
        controlEmeraldPixels,
        controlRect,
        coveredIssues: coveredIssues.slice(0, 2),
        demonstratedClasses: transformClasses,
        nativeSelectorAmberPixels,
        nativeSelectorRect,
        nativeSelectorSize,
        rotateEmeraldPixels,
        rotateRect,
        scaleX,
        scaleY,
        screenshot: screenshotPath,
        visibleRatio,
      }, null, 2)}\n`,
    )

    expect(controlEmeraldPixels).toBeGreaterThan(500)
    expect(rotateEmeraldPixels).toBeLessThan(controlEmeraldPixels * 0.2)
    expect(visibleRatio).toBeLessThan(0.2)
    expect(nativeSelectorAmberPixels).toBeGreaterThan(800)

    await assertIssue928GradientRuntime(miniProgram, {
      artifactPrefix: 'v4',
      coveredIssue: coveredIssues[2]!,
      expectedPrimaryClass: 'bg-linear-to-r',
      expectedViaClass: 'via-purple-500',
      gradientSelector: '.issue-928-gradient',
      viaSelector: '.issue-928-linear-via',
      stopSelector: '.issue-928-stop-arbitrary',
      radialSelector: '.issue-928-radial-custom',
      conicSelector: '.issue-928-conic-angle',
      arbitraryImageSelector: '.issue-928-arbitrary-image',
      compareBaselinePath: path.resolve(issue928BaselineDir, 'v4-compare.png'),
      extraVisualAssertions: async ({ page, scaleX, scaleY, screenshot }) => {
        const stopVarGradientNode = await page.$('.issue-928-stop-var')
        const arbitraryGradientNode = await page.$('.issue-928-linear-custom')
        const imageVarGradientNode = await page.$('.issue-928-image-var')
        const directEmptyFallbackNode = await page.$('.issue-928-direct-empty-fallback')
        const directEmptyFallbackNoSpaceNode = await page.$('.issue-928-direct-empty-fallback-no-space')
        expect(stopVarGradientNode).toBeTruthy()
        expect(arbitraryGradientNode).toBeTruthy()
        expect(imageVarGradientNode).toBeTruthy()
        expect(directEmptyFallbackNode).toBeTruthy()
        expect(directEmptyFallbackNoSpaceNode).toBeTruthy()
        await expect(stopVarGradientNode.attribute('class')).resolves.toContain('from-')
        await expect(arbitraryGradientNode.attribute('class')).resolves.toContain('bg-linear-')
        await expect(imageVarGradientNode.attribute('class')).resolves.toContain('bg-')
        const stopVarGradientRect = expandRect(scaleRect({ ...await stopVarGradientNode.offset(), ...await stopVarGradientNode.size() }, scaleX, scaleY), 2)
        const arbitraryGradientRect = expandRect(scaleRect({ ...await arbitraryGradientNode.offset(), ...await arbitraryGradientNode.size() }, scaleX, scaleY), 2)
        const imageVarGradientRect = expandRect(scaleRect({ ...await imageVarGradientNode.offset(), ...await imageVarGradientNode.size() }, scaleX, scaleY), 2)
        const directEmptyFallbackRect = expandRect(scaleRect({ ...await directEmptyFallbackNode.offset(), ...await directEmptyFallbackNode.size() }, scaleX, scaleY), 2)
        const directEmptyFallbackNoSpaceRect = expandRect(scaleRect({ ...await directEmptyFallbackNoSpaceNode.offset(), ...await directEmptyFallbackNoSpaceNode.size() }, scaleX, scaleY), 2)
        const stopVarGradientPurplePixels = countPurplePixels(screenshot, stopVarGradientRect)
        const arbitraryGradientRedPixels = countRedPixels(screenshot, arbitraryGradientRect)
        const arbitraryGradientYellowPixels = countYellowPixels(screenshot, arbitraryGradientRect)
        const imageVarGradientBluePixels = countBluePixels(screenshot, imageVarGradientRect)
        const directEmptyFallbackCyanPixels = countCyanPixels(screenshot, directEmptyFallbackRect)
        const directEmptyFallbackBluePixels = countBluePixels(screenshot, directEmptyFallbackRect)
        const directEmptyFallbackNoSpaceCyanPixels = countCyanPixels(screenshot, directEmptyFallbackNoSpaceRect)
        const directEmptyFallbackNoSpaceBluePixels = countBluePixels(screenshot, directEmptyFallbackNoSpaceRect)
        return {
          arbitraryGradientRedPixels,
          arbitraryGradientRect,
          arbitraryGradientYellowPixels,
          directEmptyFallbackBluePixels,
          directEmptyFallbackCyanPixels,
          directEmptyFallbackNoSpaceBluePixels,
          directEmptyFallbackNoSpaceCyanPixels,
          directEmptyFallbackNoSpaceRect,
          directEmptyFallbackRect,
          gradientClasses,
          imageVarGradientBluePixels,
          imageVarGradientRect,
          stopVarGradientPurplePixels,
          stopVarGradientRect,
        }
      },
    })
  }, 120_000)
})

describeIde.sequential('issue 928 Tailwind v4 IDE runtime', () => {
  let miniProgram: any

  beforeAll(async () => {
    if (process.env['E2E_SKIP_BUILD'] !== '1') {
      await ensureProjectBuilt(v3ProjectRoot)
    }
    await cleanupDevTools()
    try {
      const automator = new Launcher()
      miniProgram = await automator.launch({
        projectPath: v3ProjectPath,
        timeout: timeoutMs,
      })
    }
    catch (error) {
      if (error instanceof Error) {
        error.message = `${error.message}\n${await collectFrameworkIdeDiagnostics('issue-928-v3')}`
      }
      throw error
    }
  }, 180_000)

  afterAll(async () => {
    await miniProgram?.close()
    await cleanupDevTools()
  })

  it('keeps Tailwind v4 gradient utilities valid in WeChat DevTools', async () => {
    const appWxss = await fs.readFile(v3AppWxssPath, 'utf8')
    expect(appWxss).toContain('.bg-gradient-to-r')
    expect(appWxss).toContain('.from-cyan-500')
    expect(appWxss).toContain('.via-purple-500')
    expect(appWxss).toContain('.to-blue-500')
    expect(appWxss).toMatch(/background-image:\s*linear-gradient\(var\(--tw-gradient-stops\)\)/)
    expect(appWxss).toContain('--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position)),var(--tw-gradient-from) var(--tw-gradient-from-position, ),var(--tw-gradient-to) var(--tw-gradient-to-position, )')
    expect(appWxss).toContain('--tw-gradient-via-stops:var(--tw-gradient-position),var(--tw-gradient-from) var(--tw-gradient-from-position, ),var(--tw-gradient-via) var(--tw-gradient-via-position, ),var(--tw-gradient-to) var(--tw-gradient-to-position, )')
    expect(appWxss).toContain('background-image:linear-gradient(90deg,#06b6d4,#3b82f6)')
    expect(appWxss).toContain('background-image:radial-gradient(var(--tw-gradient-stops))')
    expect(appWxss).toContain('background-image:conic-gradient(var(--tw-gradient-stops))')

    await assertIssue928GradientRuntime(miniProgram, {
      artifactPrefix: 'v4-standalone',
      coveredIssue: '#928 Tailwind v4 gradient stop fallbacks',
      expectedPrimaryClass: 'bg-linear-to-r',
      expectedViaClass: 'via-purple-500',
      gradientSelector: '.issue-928-gradient',
      viaSelector: '.issue-928-linear-via',
      stopSelector: '.issue-928-stop-arbitrary',
      radialSelector: '.issue-928-radial-custom',
      conicSelector: '.issue-928-conic-angle',
      arbitraryImageSelector: '.issue-928-arbitrary-image',
      compareBaselinePath: path.resolve(issue928BaselineDir, 'v4-compare.png'),
    })
  }, 120_000)
})
