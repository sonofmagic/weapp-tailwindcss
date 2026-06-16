import fs from 'node:fs/promises'
import process from 'node:process'
import { Launcher } from '@weapp-vite/miniprogram-automator'
import { execa } from 'execa'
import path from 'pathe'
import { PNG } from 'pngjs'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { collectFrameworkIdeDiagnostics } from './frameworkIdeDiagnostics'
import { ensureProjectBuilt } from './projectBuild'

const describeIde = process.env['E2E_IDE'] === '1' ? describe : describe.skip
const projectRoot = path.resolve(__dirname, '../demo/taro-webpack-react-tailwindcss-v4')
const projectPath = projectRoot
const appWxssPath = path.resolve(projectRoot, 'dist/app.wxss')
const issue909PageUrl = '/pages/issue-909/index'
const issue928PageUrl = '/pages/issue-928/index'
const timeoutMs = Number(process.env['E2E_IDE_ISSUE_909_TIMEOUT_MS'] ?? process.env['E2E_AUTOMATOR_TIMEOUT_MS'] ?? 90_000)
const artifactDir = path.resolve(__dirname, '.artifacts/issue-909')
const isTailwindcssV4GradientFallbackEnabled = process.env['WEAPP_TW_V4_GRADIENT_FALLBACK'] !== '0'
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

interface Rect {
  left: number
  top: number
  width: number
  height: number
}

async function captureMiniProgramScreenshot(miniProgram: any, screenshotPath: string) {
  await fs.mkdir(path.dirname(screenshotPath), { recursive: true })
  const result = await miniProgram.send('App.captureScreenshot', {}, {
    timeout: Math.min(timeoutMs, 30_000),
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

describeIde.sequential('issues 909/916/928 IDE runtime', () => {
  let miniProgram: any

  beforeAll(async () => {
    if (process.env['E2E_SKIP_BUILD'] !== '1') {
      await ensureProjectBuilt(projectRoot)
    }
    await cleanupDevTools()
    try {
      const automator = new Launcher()
      miniProgram = await automator.launch({
        projectPath,
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
    const appWxss = await fs.readFile(appWxssPath, 'utf8')
    for (const className of transformClasses) {
      expect(appWxss).toMatch(toCssSelector(className))
    }
    for (const className of gradientClasses) {
      expect(appWxss).toMatch(toCssSelector(className))
    }
    expect(appWxss).toMatch(/transform:\s*var\(--tw-rotate-x, \) var\(--tw-rotate-y, \) var\(--tw-rotate-z, \) var\(--tw-skew-x, \) var\(--tw-skew-y, \)/)
    expect(appWxss).not.toMatch(/transform:\s*var\(--tw-rotate-x,\) var\(--tw-rotate-y,\)/)
    expect(appWxss).toMatch(/(?:^|\n)view\s*\{[\s\S]*?box-sizing:\s*border-box;[\s\S]*?\n\}/)
    expect(appWxss).toMatch(/background-image:\s*linear-gradient\(var\(--tw-gradient-position\),\s*var\(--tw-gradient-from\) var\(--tw-gradient-from-position, \),\s*var\(--tw-gradient-to\) var\(--tw-gradient-to-position, \)\)/)
    expect(appWxss).toMatch(/\.bg-linear-to-r\s*\{\s*--tw-gradient-position:\s*to right;\s*background-image:\s*linear-gradient/)
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
      expect(appWxss).toContain('background-image: linear-gradient(var(--tw-gradient-stops,25deg,#ef4444 5%,#eab308 60%,#22c55e 90%,#14b8a6))')
      expect(appWxss).toContain('background-image: conic-gradient(var(--tw-gradient-stops,from 45deg at 50% 50%,#ef4444,#eab308,#22c55e))')
    }
    expect(appWxss).toContain('background-image: linear-gradient(to right,#06b6d4,#3b82f6)')
    expect(appWxss, 'issue 928 should keep mini-program parseable gradient via fallback')
      .toContain('--tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position)),')
    expect(appWxss, 'issue 928 should keep from-position fallback in gradient stops')
      .toContain('var(--tw-gradient-from) var(--tw-gradient-from-position, )')
    expect(appWxss, 'issue 928 should keep to-position fallback in gradient stops')
      .toContain('var(--tw-gradient-to) var(--tw-gradient-to-position, )')
    expect(appWxss).not.toContain('--tw-gradient-via-stops: initial')
    expect(appWxss).not.toContain('to right in oklab')
    expect(appWxss).not.toContain('var(--tw-gradient-via-stops, var(--tw-gradient-position),')
    expect(appWxss).not.toContain('var(--tw-gradient-from) var(--tw-gradient-from-position),')
    expect(appWxss).not.toContain('var(--tw-gradient-to) var(--tw-gradient-to-position))')

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

    const gradientPage = await miniProgram.reLaunch(issue928PageUrl)
    await gradientPage.waitFor(1000)
    const gradientNode = await gradientPage.$('.issue-928-gradient')
    const viaGradientNode = await gradientPage.$('.issue-928-linear-via')
    const stopArbitraryGradientNode = await gradientPage.$('.issue-928-stop-arbitrary')
    const stopVarGradientNode = await gradientPage.$('.issue-928-stop-var')
    const radialGradientNode = await gradientPage.$('.issue-928-radial-custom')
    const conicGradientNode = await gradientPage.$('.issue-928-conic-angle')
    const arbitraryGradientNode = await gradientPage.$('.issue-928-linear-custom')
    const arbitraryImageGradientNode = await gradientPage.$('.issue-928-arbitrary-image')
    const imageVarGradientNode = await gradientPage.$('.issue-928-image-var')
    expect(gradientNode).toBeTruthy()
    expect(viaGradientNode).toBeTruthy()
    expect(stopArbitraryGradientNode).toBeTruthy()
    expect(stopVarGradientNode).toBeTruthy()
    expect(radialGradientNode).toBeTruthy()
    expect(conicGradientNode).toBeTruthy()
    expect(arbitraryGradientNode).toBeTruthy()
    expect(arbitraryImageGradientNode).toBeTruthy()
    expect(imageVarGradientNode).toBeTruthy()
    await expect(gradientNode.attribute('class')).resolves.toContain('bg-linear-to-r')
    await expect(viaGradientNode.attribute('class')).resolves.toContain('via-purple-500')
    await expect(stopArbitraryGradientNode.attribute('class')).resolves.toContain('from-')
    await expect(stopVarGradientNode.attribute('class')).resolves.toContain('from-')
    await expect(radialGradientNode.attribute('class')).resolves.toContain('bg-radial')
    await expect(conicGradientNode.attribute('class')).resolves.toContain('bg-conic-180')
    await expect(arbitraryGradientNode.attribute('class')).resolves.toContain('bg-linear-')
    await expect(arbitraryImageGradientNode.attribute('class')).resolves.toContain('bg-')
    await expect(imageVarGradientNode.attribute('class')).resolves.toContain('bg-')

    const gradientScreenshotPath = path.resolve(artifactDir, 'issue-928-gradient.png')
    await captureMiniProgramScreenshot(miniProgram, gradientScreenshotPath)
    const gradientScreenshot = await readScreenshot(gradientScreenshotPath)
    const gradientPageSize = await gradientPage.size()
    const gradientOffset = await gradientNode.offset()
    const gradientSize = await gradientNode.size()
    const gradientScaleX = gradientScreenshot.width / gradientPageSize.width
    const gradientScaleY = gradientScreenshot.height / gradientPageSize.height
    const gradientRect = expandRect(scaleRect({ ...gradientOffset, ...gradientSize }, gradientScaleX, gradientScaleY), 2)
    const viaGradientRect = expandRect(scaleRect({ ...await viaGradientNode.offset(), ...await viaGradientNode.size() }, gradientScaleX, gradientScaleY), 2)
    const stopVarGradientRect = expandRect(scaleRect({ ...await stopVarGradientNode.offset(), ...await stopVarGradientNode.size() }, gradientScaleX, gradientScaleY), 2)
    const radialGradientRect = expandRect(scaleRect({ ...await radialGradientNode.offset(), ...await radialGradientNode.size() }, gradientScaleX, gradientScaleY), 2)
    const conicGradientRect = expandRect(scaleRect({ ...await conicGradientNode.offset(), ...await conicGradientNode.size() }, gradientScaleX, gradientScaleY), 2)
    const arbitraryGradientRect = expandRect(scaleRect({ ...await arbitraryGradientNode.offset(), ...await arbitraryGradientNode.size() }, gradientScaleX, gradientScaleY), 2)
    const arbitraryImageGradientRect = expandRect(scaleRect({ ...await arbitraryImageGradientNode.offset(), ...await arbitraryImageGradientNode.size() }, gradientScaleX, gradientScaleY), 2)
    const imageVarGradientRect = expandRect(scaleRect({ ...await imageVarGradientNode.offset(), ...await imageVarGradientNode.size() }, gradientScaleX, gradientScaleY), 2)
    const gradientBluePixels = countBluePixels(gradientScreenshot, gradientRect)
    const gradientCyanPixels = countCyanPixels(gradientScreenshot, gradientRect)
    const viaGradientPurplePixels = countPurplePixels(gradientScreenshot, viaGradientRect)
    const stopVarGradientPurplePixels = countPurplePixels(gradientScreenshot, stopVarGradientRect)
    const radialGradientPurplePixels = countPurplePixels(gradientScreenshot, radialGradientRect)
    const conicGradientPurplePixels = countPurplePixels(gradientScreenshot, conicGradientRect)
    const arbitraryGradientRedPixels = countRedPixels(gradientScreenshot, arbitraryGradientRect)
    const arbitraryGradientYellowPixels = countYellowPixels(gradientScreenshot, arbitraryGradientRect)
    const arbitraryImageGradientBluePixels = countBluePixels(gradientScreenshot, arbitraryImageGradientRect)
    const imageVarGradientBluePixels = countBluePixels(gradientScreenshot, imageVarGradientRect)

    await fs.writeFile(
      path.resolve(artifactDir, 'issue-928-gradient-visual.json'),
      `${JSON.stringify({
        arbitraryGradientRedPixels,
        arbitraryGradientRect,
        arbitraryGradientYellowPixels,
        arbitraryImageGradientBluePixels,
        arbitraryImageGradientRect,
        conicGradientPurplePixels,
        conicGradientRect,
        coveredIssues: coveredIssues.slice(2),
        gradientBluePixels,
        gradientClasses,
        gradientCyanPixels,
        gradientRect,
        gradientScaleX,
        gradientScaleY,
        imageVarGradientBluePixels,
        imageVarGradientRect,
        radialGradientPurplePixels,
        radialGradientRect,
        screenshot: gradientScreenshotPath,
        stopVarGradientPurplePixels,
        stopVarGradientRect,
        viaGradientPurplePixels,
        viaGradientRect,
      }, null, 2)}\n`,
    )

    expect(gradientCyanPixels).toBeGreaterThan(100)
    expect(gradientBluePixels).toBeGreaterThan(100)
    expect(viaGradientPurplePixels).toBeGreaterThan(100)
    expect(stopVarGradientPurplePixels).toBeGreaterThan(100)
    expect(radialGradientPurplePixels).toBeGreaterThan(100)
    expect(conicGradientPurplePixels).toBeGreaterThan(100)
    expect(arbitraryGradientRedPixels).toBeGreaterThan(100)
    expect(arbitraryGradientYellowPixels).toBeGreaterThan(100)
    expect(arbitraryImageGradientBluePixels).toBeGreaterThan(100)
    expect(imageVarGradientBluePixels).toBeGreaterThan(100)
  }, 120_000)
})
