import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import { PNG } from 'pngjs'

const repoRoot = path.resolve(import.meta.dirname, '..')
const artifactsRoot = path.join(repoRoot, 'e2e/.artifacts/lynx-ios')
const targetColor = { r: 14, g: 165, b: 233 }

function isMac() {
  return process.platform === 'darwin'
}

async function command(name: string, args: string[]) {
  return execa(name, args, { cwd: repoRoot, reject: false, timeout: 30_000 })
}

async function main() {
  if (!isMac()) {
    console.log('SKIP: Lynx iOS visual E2E requires macOS and Xcode Simulator.')
    return
  }
  const simctl = await command('xcrun', ['simctl', 'list', 'devices'])
  if (simctl.exitCode !== 0 || !simctl.stdout.includes('(Booted)')) {
    console.log('SKIP: no booted iOS Simulator was found.')
    return
  }
  const apps = await command('xcrun', ['simctl', 'listapps', 'booted'])
  if (apps.exitCode !== 0 || !apps.stdout.includes('com.lynx.LynxExplorer')) {
    console.log('SKIP: LynxExplorer (com.lynx.LynxExplorer) is not installed.')
    return
  }
  const url = process.env['LYNX_BUNDLE_URL']
  if (!url) {
    console.log('SKIP: set LYNX_BUNDLE_URL to a reachable Rspeedy dev bundle URL.')
    return
  }
  const artifactDir = await fs.mkdtemp(path.join(artifactsRoot, `${Date.now()}-`)).catch(async () => {
    await fs.mkdir(artifactsRoot, { recursive: true })
    return fs.mkdtemp(path.join(artifactsRoot, `${Date.now()}-`))
  })
  await fs.writeFile(path.join(artifactDir, 'bundle-url.txt'), `${url}\n`)
  await fs.writeFile(path.join(artifactDir, 'simulator.txt'), simctl.stdout)
  const opened = await command('xcrun', ['simctl', 'openurl', 'booted', `lynx://${url}`])
  if (opened.exitCode !== 0) {
    throw new Error(opened.stderr || 'simctl openurl failed')
  }
  const screenshotPath = path.join(artifactDir, 'final.png')
  const screenshot = await command('xcrun', ['simctl', 'io', 'booted', 'screenshot', screenshotPath])
  if (screenshot.exitCode !== 0) {
    throw new Error(screenshot.stderr || 'simctl screenshot failed')
  }
  const png = PNG.sync.read(await fs.readFile(screenshotPath))
  let matching = 0
  let nonWhite = 0
  for (let y = 120; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const i = (y * png.width + x) * 4
      const r = png.data[i] ?? 0
      const g = png.data[i + 1] ?? 0
      const b = png.data[i + 2] ?? 0
      if (r < 245 || g < 245 || b < 245) {
        nonWhite++
      }
      if (Math.abs(r - targetColor.r) <= 12 && Math.abs(g - targetColor.g) <= 12 && Math.abs(b - targetColor.b) <= 12) {
        matching++
      }
    }
  }
  const result = { width: png.width, height: png.height, matchingPixels: matching, nonWhitePixels: nonWhite, ratio: matching / Math.max(nonWhite, 1), screenshotPath }
  await fs.writeFile(path.join(artifactDir, 'pixels.json'), `${JSON.stringify(result, null, 2)}\n`)
  if (matching < 500) {
    throw new Error(`Tailwind background was not visible: ${JSON.stringify(result)}`)
  }
  console.log(JSON.stringify(result, null, 2))
}

void main()
