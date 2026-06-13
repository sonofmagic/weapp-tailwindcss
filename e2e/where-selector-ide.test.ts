import fs from 'node:fs/promises'
import process from 'node:process'
import { Launcher } from '@weapp-vite/miniprogram-automator'
import { execa } from 'execa'
import path from 'pathe'
import { PNG } from 'pngjs'
import { afterAll, describe, expect, it } from 'vitest'
import { collectFrameworkIdeDiagnostics } from './frameworkIdeDiagnostics'

const describeIde = process.env['E2E_IDE'] === '1' ? describe : describe.skip
const timeoutMs = Number(process.env['E2E_IDE_WHERE_SELECTOR_TIMEOUT_MS'] ?? process.env['E2E_AUTOMATOR_TIMEOUT_MS'] ?? 90_000)
const closeTimeoutMs = Number(process.env['E2E_IDE_CLOSE_TIMEOUT_MS'] ?? 5000)
const artifactDir = path.resolve(__dirname, '.artifacts/where-selector')
const fixturesRoot = path.resolve(__dirname, 'fixtures')
const pageUrl = '/pages/index/index'

interface Rect {
  height: number
  left: number
  top: number
  width: number
}

interface ProbeResult {
  bluePixels: number
  compileError?: string
  greenPixels: number
  redPixels: number
  screenshot?: string
  targetRect?: Rect
}

function fixturePath(name: string) {
  return path.resolve(fixturesRoot, name)
}

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

function scaleRect(rect: Rect, scaleX: number, scaleY: number): Rect {
  return {
    height: rect.height * scaleY,
    left: rect.left * scaleX,
    top: rect.top * scaleY,
    width: rect.width * scaleX,
  }
}

function expandRect(rect: Rect, padding: number): Rect {
  return {
    height: rect.height + padding * 2,
    left: rect.left - padding,
    top: rect.top - padding,
    width: rect.width + padding * 2,
  }
}

function countPixels(png: PNG, rect: Rect, matcher: (red: number, green: number, blue: number, alpha: number) => boolean) {
  const left = Math.max(0, Math.floor(rect.left))
  const top = Math.max(0, Math.floor(rect.top))
  const right = Math.min(png.width, Math.ceil(rect.left + rect.width))
  const bottom = Math.min(png.height, Math.ceil(rect.top + rect.height))
  let pixels = 0

  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const index = (png.width * y + x) * 4
      const red = png.data[index] ?? 0
      const green = png.data[index + 1] ?? 0
      const blue = png.data[index + 2] ?? 0
      const alpha = png.data[index + 3] ?? 0
      if (matcher(red, green, blue, alpha)) {
        pixels++
      }
    }
  }

  return pixels
}

function isRed(red: number, green: number, blue: number, alpha: number) {
  return alpha > 180 && red > 150 && green < 90 && blue < 90
}

function isGreen(red: number, green: number, blue: number, alpha: number) {
  return alpha > 180 && green > 110 && red < 90 && blue < 110
}

function isBlue(red: number, green: number, blue: number, alpha: number) {
  return alpha > 180 && blue > 130 && red < 90 && green > 70 && green < 140
}

function isCompileError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /WXSS|文件编译错误|compile|error at token|CssSyntaxError/i.test(message)
}

async function runProbe(projectName: string, screenshotName: string): Promise<ProbeResult> {
  const projectPath = fixturePath(projectName)
  const automator = new Launcher()
  let miniProgram: any
  try {
    await cleanupDevTools()
    miniProgram = await automator.launch({
      projectPath,
      timeout: timeoutMs,
    })
    const page = await miniProgram.reLaunch(pageUrl)
    await page.waitFor(1000)
    const target = await page.$('.where-target')
    expect(target, `${projectName} should render .where-target`).toBeTruthy()
    const targetOffset = await target.offset()
    const targetSize = await target.size()
    const pageSize = await page.size()
    const screenshotPath = path.resolve(artifactDir, screenshotName)
    await captureMiniProgramScreenshot(miniProgram, screenshotPath)
    const screenshot = await readScreenshot(screenshotPath)
    const scaleX = screenshot.width / pageSize.width
    const scaleY = screenshot.height / pageSize.height
    const targetRect = expandRect(scaleRect({ ...targetOffset, ...targetSize }, scaleX, scaleY), -4)

    return {
      bluePixels: countPixels(screenshot, targetRect, isBlue),
      greenPixels: countPixels(screenshot, targetRect, isGreen),
      redPixels: countPixels(screenshot, targetRect, isRed),
      screenshot: screenshotPath,
      targetRect,
    }
  }
  catch (error) {
    if (isCompileError(error)) {
      return {
        bluePixels: 0,
        compileError: error instanceof Error ? error.message : String(error),
        greenPixels: 0,
        redPixels: 0,
      }
    }
    if (error instanceof Error) {
      error.message = `${error.message}\n${await collectFrameworkIdeDiagnostics(projectName)}`
    }
    throw error
  }
  finally {
    await miniProgram?.close().catch(() => undefined)
    await cleanupDevTools()
  }
}

async function writeEvidence(fileName: string, evidence: unknown) {
  await fs.mkdir(artifactDir, { recursive: true })
  await fs.writeFile(path.resolve(artifactDir, fileName), `${JSON.stringify(evidence, null, 2)}\n`)
}

describeIde.sequential('where selector IDE runtime', () => {
  afterAll(async () => {
    await cleanupDevTools()
  })

  it('checks raw :where support and verifies class-selector translation in WeChat DevTools', async () => {
    const raw = await runProbe('where-selector-raw-miniprogram', 'raw-where.png')
    const translated = await runProbe('where-selector-translated-miniprogram', 'translated-where.png')
    const evidence = {
      raw,
      rawWhereCompiled: !raw.compileError,
      rawWhereMatched: raw.redPixels > 200,
      rawWhereMultiSelectorMatched: raw.bluePixels > 80,
      translated,
      translatedClassSelectorMatched: translated.greenPixels > 200,
      translatedCommaSelectorMatched: translated.bluePixels > 80,
    }
    await writeEvidence('where-selector-evidence.json', evidence)

    expect(
      evidence.translatedClassSelectorMatched,
      `转译后的普通 class 选择器应在 IDE 中生效: ${JSON.stringify(translated)}`,
    ).toBe(true)
    expect(
      evidence.translatedCommaSelectorMatched,
      `转译后的逗号普通 class 选择器应在 IDE 中生效: ${JSON.stringify(translated)}`,
    ).toBe(true)
  }, 180_000)
})
