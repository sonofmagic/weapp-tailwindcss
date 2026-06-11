import fs from 'node:fs/promises'
import process from 'node:process'
import { Launcher } from '@weapp-vite/miniprogram-automator'
import path from 'pathe'
import { PNG } from 'pngjs'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ensureProjectBuilt } from './projectBuild'

const describeIde = process.env['E2E_IDE'] === '1' ? describe : describe.skip
const projectRoot = path.resolve(__dirname, '../demo/taro-webpack-react-tailwindcss-v4')
const projectPath = projectRoot
const appWxssPath = path.resolve(projectRoot, 'dist/app.wxss')
const pageUrl = '/pages/issue-909/index'
const timeoutMs = Number(process.env['E2E_AUTOMATOR_TIMEOUT_MS'] ?? 30_000)
const artifactDir = path.resolve(__dirname, '.artifacts/issue-909')
const transformClasses = [
  'rotate-y-90',
  'rotate-y-45',
  '-rotate-y-45',
  'rotate-x-45',
  'rotate-z-45',
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

function countEmeraldPixels(png: PNG, rect: Rect) {
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

      if (alpha > 180 && green > 130 && green > red + 30 && green > blue + 20) {
        pixels++
      }
    }
  }

  return pixels
}

function toCssSelector(className: string) {
  return `.${className}{`
}

describeIde.sequential('issue 909 IDE runtime', () => {
  let miniProgram: any

  beforeAll(async () => {
    if (process.env['E2E_SKIP_BUILD'] !== '1') {
      await ensureProjectBuilt(projectRoot)
    }
    const automator = new Launcher()
    miniProgram = await automator.launch({
      projectPath,
      timeout: timeoutMs,
    })
  }, 180_000)

  afterAll(async () => {
    await miniProgram?.close()
  })

  it('keeps Tailwind v4 empty transform fallbacks valid and visually applies 3D rotate utilities in WeChat DevTools', async () => {
    const appWxss = await fs.readFile(appWxssPath, 'utf8')
    for (const className of transformClasses) {
      expect(appWxss).toContain(toCssSelector(className))
    }
    expect(appWxss).toContain('transform:var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, )')
    expect(appWxss).not.toContain('transform:var(--tw-rotate-x,) var(--tw-rotate-y,)')

    const page = await miniProgram.reLaunch(pageUrl)
    await page.waitFor(1000)
    const controlNode = await page.$('.issue-909-box-control')
    const rotateNode = await page.$('.issue-909-box-rotate-y-90')
    const rotateY45Node = await page.$('.issue-909-box-rotate-y-45')
    const negativeRotateY45Node = await page.$('.issue-909-box-negative-rotate-y-45')
    const rotateX45Node = await page.$('.issue-909-box-rotate-x-45')
    const rotateZ45Node = await page.$('.issue-909-box-rotate-z-45')
    expect(controlNode).toBeTruthy()
    expect(rotateNode).toBeTruthy()
    expect(rotateY45Node).toBeTruthy()
    expect(negativeRotateY45Node).toBeTruthy()
    expect(rotateX45Node).toBeTruthy()
    expect(rotateZ45Node).toBeTruthy()

    const className = await rotateNode.attribute('class')
    expect(className).toContain('rotate-y-90')
    await expect(rotateY45Node.attribute('class')).resolves.toContain('rotate-y-45')
    await expect(negativeRotateY45Node.attribute('class')).resolves.toContain('-rotate-y-45')
    await expect(rotateX45Node.attribute('class')).resolves.toContain('rotate-x-45')
    await expect(rotateZ45Node.attribute('class')).resolves.toContain('rotate-z-45')

    const screenshotPath = path.resolve(artifactDir, 'transform-utilities.png')
    await captureMiniProgramScreenshot(miniProgram, screenshotPath)
    const screenshot = await readScreenshot(screenshotPath)
    const controlOffset = await controlNode.offset()
    const controlSize = await controlNode.size()
    const rotateOffset = await rotateNode.offset()
    const rotateSize = await rotateNode.size()
    const controlRect = expandRect({ ...controlOffset, ...controlSize }, 4)
    const rotateRect = expandRect({ ...rotateOffset, ...rotateSize }, 4)
    const controlEmeraldPixels = countEmeraldPixels(screenshot, controlRect)
    const rotateEmeraldPixels = countEmeraldPixels(screenshot, rotateRect)
    const visibleRatio = rotateEmeraldPixels / Math.max(controlEmeraldPixels, 1)

    await fs.writeFile(
      path.resolve(artifactDir, 'rotate-y-90-visual.json'),
      `${JSON.stringify({
        className,
        controlEmeraldPixels,
        controlRect,
        demonstratedClasses: transformClasses,
        rotateEmeraldPixels,
        rotateRect,
        screenshot: screenshotPath,
        visibleRatio,
      }, null, 2)}\n`,
    )

    expect(controlEmeraldPixels).toBeGreaterThan(500)
    expect(rotateEmeraldPixels).toBeLessThan(controlEmeraldPixels * 0.2)
    expect(visibleRatio).toBeLessThan(0.2)
  }, 120_000)
})
