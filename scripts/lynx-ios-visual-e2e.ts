import type { ExecaChildProcess } from 'execa'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { stripVTControlCharacters } from 'node:util'
import { execa } from 'execa'
import { PNG } from 'pngjs'
import postcss from 'postcss'

const repoRoot = path.resolve(import.meta.dirname, '..')
const exampleDir = path.join(repoRoot, 'examples/react-lynx')
const artifactsRoot = path.join(repoRoot, 'e2e/.artifacts/lynx-ios')
const generatedCssPath = path.join(exampleDir, 'dist/.rspeedy/main/main.css')
const simulatorAppId = 'com.lynx.LynxExplorer'

async function command(name: string, args: string[], options: { input?: string } = {}) {
  return execa(name, args, {
    cwd: repoRoot,
    reject: false,
    timeout: 30_000,
    ...options,
  })
}

async function waitFor<T>(factory: () => Promise<T | undefined>, timeout: number, label: string) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const value = await factory()
    if (value !== undefined) {
      return value
    }
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error(`Timed out waiting for ${label}.`)
}

async function startDevServer() {
  const configuredUrl = process.env['LYNX_BUNDLE_URL']
  if (configuredUrl) {
    return { url: configuredUrl, logs: '', stop: async () => {} }
  }

  let logs = ''
  const child = execa('pnpm', ['--filter', '@weapp-tailwindcss/example-react-lynx', 'dev'], {
    all: true,
    cwd: repoRoot,
    reject: false,
  }) as ExecaChildProcess
  child.all?.on('data', (chunk) => {
    const text = chunk.toString()
    logs += text
    process.stdout.write(text)
  })
  const url = await waitFor(async () => {
    const match = stripVTControlCharacters(logs).match(/https?:\/\/\S+\/main\.lynx\.bundle/)
    return match?.[0]
  }, 60_000, 'Rspeedy bundle URL')

  return {
    url,
    get logs() {
      return logs
    },
    async stop() {
      child.kill('SIGINT')
      await Promise.race([
        child.catch(() => undefined),
        new Promise(resolve => setTimeout(resolve, 5_000)),
      ])
      if (!child.killed) {
        child.kill('SIGTERM')
      }
    },
  }
}

async function pollBundle(url: string) {
  await waitFor(async () => {
    try {
      const response = await fetch(url)
      return response.ok && (await response.arrayBuffer()).byteLength > 1024 ? true : undefined
    }
    catch {
      return undefined
    }
  }, 60_000, 'reachable Lynx bundle')
}

function parseCssColor(value: string) {
  const normalizedValue = value.replaceAll(/\s+/g, '')
  const rgb = normalizedValue.match(/^rgba?\((\d+),(\d+),(\d+)/i)
  if (rgb) {
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]), css: value }
  }
  const hex = value.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1]
  if (!hex) {
    throw new Error(`Unsupported generated Tailwind color: ${value}`)
  }
  const normalized = hex.length === 3 ? [...hex].map(char => `${char}${char}`).join('') : hex
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
    css: value,
  }
}

async function readGeneratedTargetColor() {
  const root = postcss.parse(await fs.readFile(generatedCssPath, 'utf8'))
  let value: string | undefined
  root.walkRules('.bg-sky-500', (rule) => {
    rule.walkDecls('background-color', (decl) => {
      value = decl.value.trim()
    })
  })
  if (!value) {
    throw new Error('Generated .bg-sky-500 background-color was not found.')
  }
  return parseCssColor(value)
}

function analyzeScreenshot(png: PNG, target: Awaited<ReturnType<typeof readGeneratedTargetColor>>) {
  let matchingPixels = 0
  let nonWhitePixels = 0
  let whitePixelsInTargetBounds = 0
  let minX = png.width
  let minY = png.height
  let maxX = -1
  let maxY = -1
  const isTarget = (r: number, g: number, b: number) => (
    Math.abs(r - target.r) <= 8
    && Math.abs(g - target.g) <= 8
    && Math.abs(b - target.b) <= 8
  )

  for (let y = 120; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const offset = (y * png.width + x) * 4
      const r = png.data[offset] ?? 0
      const g = png.data[offset + 1] ?? 0
      const b = png.data[offset + 2] ?? 0
      if (r < 245 || g < 245 || b < 245) {
        nonWhitePixels++
      }
      if (isTarget(r, g, b)) {
        matchingPixels++
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  const bounds = maxX >= minX && maxY >= minY
    ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
    : undefined
  if (bounds) {
    for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
      for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
        const offset = (y * png.width + x) * 4
        if ((png.data[offset] ?? 0) >= 245 && (png.data[offset + 1] ?? 0) >= 245 && (png.data[offset + 2] ?? 0) >= 245) {
          whitePixelsInTargetBounds++
        }
      }
    }
  }
  const targetArea = bounds ? bounds.width * bounds.height : 0
  return {
    width: png.width,
    height: png.height,
    target,
    matchingPixels,
    nonWhitePixels,
    targetRatio: matchingPixels / Math.max(targetArea, 1),
    whitePixelsInTargetBounds,
    bounds,
  }
}

function cropPng(png: PNG, bounds: NonNullable<ReturnType<typeof analyzeScreenshot>['bounds']>) {
  const crop = new PNG({ width: bounds.width, height: bounds.height })
  PNG.bitblt(png, crop, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0)
  return crop
}

async function waitForManualLoad(url: string) {
  await command('xcrun', ['simctl', 'pbcopy', 'booted'], { input: url })
  if (process.env['LYNX_ASSUME_LOADED'] === '1') {
    return
  }
  if (!process.stdin.isTTY) {
    throw new Error('LynxExplorer has no working deep link handler. Run in a TTY, paste the prepared URL, tap Go, then press Enter.')
  }
  console.log(`\nLynx bundle URL copied to Simulator pasteboard:\n${url}`)
  console.log('Open LynxExplorer, paste the URL, tap Go, wait for the page, then press Enter here.')
  await new Promise<void>((resolve) => {
    process.stdin.resume()
    process.stdin.once('data', () => resolve())
  })
}

async function main() {
  if (process.platform !== 'darwin') {
    console.log('SKIP: Lynx iOS visual E2E requires macOS and Xcode Simulator.')
    return
  }
  const simctl = await command('xcrun', ['simctl', 'list', 'devices'])
  if (simctl.exitCode !== 0 || !simctl.stdout.includes('(Booted)')) {
    console.log('SKIP: no booted iOS Simulator was found.')
    return
  }
  const apps = await command('xcrun', ['simctl', 'listapps', 'booted'])
  if (apps.exitCode !== 0 || !apps.stdout.includes(simulatorAppId)) {
    console.log(`SKIP: LynxExplorer (${simulatorAppId}) is not installed.`)
    return
  }

  await fs.mkdir(artifactsRoot, { recursive: true })
  const artifactDir = await fs.mkdtemp(path.join(artifactsRoot, `${Date.now()}-`))
  const dev = await startDevServer()
  try {
    await pollBundle(dev.url)
    const url = `${dev.url}${dev.url.includes('?') ? '&' : '?'}visual=${Date.now()}`
    await fs.writeFile(path.join(artifactDir, 'bundle-url.txt'), `${url}\n`)
    await fs.writeFile(path.join(artifactDir, 'simulator.txt'), simctl.stdout)
    await command('xcrun', ['simctl', 'io', 'booted', 'screenshot', path.join(artifactDir, 'initial.png')])
    await waitForManualLoad(url)

    const target = await readGeneratedTargetColor()
    const screenshotPath = path.join(artifactDir, 'final.png')
    await command('xcrun', ['simctl', 'io', 'booted', 'screenshot', screenshotPath])
    const png = PNG.sync.read(await fs.readFile(screenshotPath))
    const result = analyzeScreenshot(png, target)
    if (result.bounds) {
      await fs.writeFile(path.join(artifactDir, 'target-crop.png'), PNG.sync.write(cropPng(png, result.bounds)))
    }
    await fs.writeFile(path.join(artifactDir, 'pixels.json'), `${JSON.stringify({ ...result, screenshotPath }, null, 2)}\n`)
    await fs.writeFile(path.join(artifactDir, 'rspeedy.log'), dev.logs)

    const minimumPixels = png.width * 40
    if (
      result.matchingPixels < minimumPixels
      || !result.bounds
      || result.bounds.width < png.width * 0.7
      || result.bounds.height < 40
      || result.targetRatio < 0.7
      || result.whitePixelsInTargetBounds < 100
    ) {
      throw new Error(`Tailwind visual assertion failed: ${JSON.stringify(result)}`)
    }
    console.log(JSON.stringify({ ...result, screenshotPath, artifactDir }, null, 2))
  }
  finally {
    await dev.stop()
  }
}

void main()
