import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(webRoot, '..', '..')
const require = createRequire(path.join(repoRoot, 'package.json'))
const { chromium } = require('playwright')
const pixelmatch = require('pixelmatch').default
const { PNG } = require('pngjs')

const outputDir = process.env.WEB_DEMO_COMPARE_OUTPUT
  ? path.resolve(process.env.WEB_DEMO_COMPARE_OUTPUT)
  : path.join(webRoot, '.compare-dev-weapp')

const projects = [
  'react-vite-tailwindcss-v3',
  'react-vite-tailwindcss-v4',
  'vue-vite-tailwindcss-v3',
  'vue-vite-tailwindcss-v4',
]

function resolveChromeExecutablePath() {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  }

  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ]
  return candidates.find(candidate => existsSync(candidate))
}

function runServer(cwd, target, port) {
  const child = spawn('pnpm', ['exec', 'vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd,
    env: {
      ...process.env,
      ...(target === 'weapp' ? { WEAPP_TW_TARGET: 'weapp' } : {}),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let logs = ''
  child.stdout.on('data', (chunk) => {
    logs += chunk.toString()
  })
  child.stderr.on('data', (chunk) => {
    logs += chunk.toString()
  })
  return { child, logs: () => logs }
}

async function waitForUrl(url, server, timeout = 60_000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    if (server.child.exitCode !== null) {
      throw new Error(`server exited before ready: ${url}\n${server.logs()}`)
    }
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    }
    catch {
      // 服务启动前请求失败是预期情况，继续轮询。
    }
    await delay(500)
  }
  throw new Error(`timeout waiting for ${url}\n${server.logs()}`)
}

async function stopServer(server) {
  if (server.child.exitCode !== null) {
    return
  }
  server.child.kill('SIGTERM')
  await Promise.race([
    new Promise(resolve => server.child.once('exit', resolve)),
    delay(3_000).then(() => {
      server.child.kill('SIGKILL')
    }),
  ])
}

async function collectPage(page, url, name) {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForSelector('main')
  await page.screenshot({
    path: path.join(outputDir, `${name}.png`),
    fullPage: true,
    animations: 'disabled',
  })
  return page.evaluate(() => {
    const pick = (el) => {
      if (!el) {
        return null
      }
      const style = getComputedStyle(el)
      const before = getComputedStyle(el, '::before')
      const rect = el.getBoundingClientRect()
      return {
        tag: el.tagName,
        text: el.textContent?.trim(),
        className: el.getAttribute('class'),
        rect: {
          x: Math.round(rect.x * 100) / 100,
          y: Math.round(rect.y * 100) / 100,
          width: Math.round(rect.width * 100) / 100,
          height: Math.round(rect.height * 100) / 100,
        },
        display: style.display,
        gridTemplateColumns: style.gridTemplateColumns,
        gap: style.gap,
        padding: style.padding,
        marginTop: style.marginTop,
        marginLeft: style.marginLeft,
        width: style.width,
        minWidth: style.minWidth,
        transform: style.transform,
        opacity: style.opacity,
        color: style.color,
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        borderTopWidth: style.borderTopWidth,
        borderTopStyle: style.borderTopStyle,
        borderTopColor: style.borderTopColor,
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        beforeContent: before.content,
        beforeMarginRight: before.marginRight,
      }
    }

    return {
      bodyHtmlClass: document.documentElement.getAttribute('class'),
      main: pick(document.querySelector('main')),
      section: pick(document.querySelector('section')),
      card: pick(document.querySelector('section > div:nth-child(1)')),
      title: pick(document.querySelector('h1')),
      paragraph: pick(document.querySelector('p')),
      swatchGrid: pick(document.querySelector('section > div:nth-child(2)')),
      swatches: [...document.querySelectorAll('section > div:nth-child(2) > div')].map(pick),
      arbitraryBox: pick(document.querySelector('section > div:nth-child(3)')),
      arbitrary: pick(document.querySelector('section > div:nth-child(3) > div:nth-child(1)')),
      decimal: pick(document.querySelector('section > div:nth-child(3) > div:nth-child(2)')),
      button: pick(document.querySelector('button')),
    }
  })
}

function diffObjects(a, b, prefix = '') {
  const diffs = []
  if (a === b) {
    return diffs
  }
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    diffs.push({ path: prefix, web: a, weapp: b })
    return diffs
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    diffs.push(...diffObjects(a[key], b[key], prefix ? `${prefix}.${key}` : key))
  }
  return diffs
}

async function compareScreenshots(name) {
  const webPng = PNG.sync.read(await fs.readFile(path.join(outputDir, `${name}-web.png`)))
  const weappPng = PNG.sync.read(await fs.readFile(path.join(outputDir, `${name}-weapp.png`)))
  if (webPng.width !== weappPng.width || webPng.height !== weappPng.height) {
    return { comparable: false, reason: `${webPng.width}x${webPng.height} vs ${weappPng.width}x${weappPng.height}` }
  }

  const diffPng = new PNG({ width: webPng.width, height: webPng.height })
  const differentPixels = pixelmatch(webPng.data, weappPng.data, diffPng.data, webPng.width, webPng.height, { threshold: 0.1 })
  await fs.writeFile(path.join(outputDir, `${name}-diff.png`), PNG.sync.write(diffPng))
  return {
    comparable: true,
    width: webPng.width,
    height: webPng.height,
    differentPixels,
    ratio: differentPixels / (webPng.width * webPng.height),
  }
}

async function main() {
  await fs.rm(outputDir, { recursive: true, force: true })
  await fs.mkdir(outputDir, { recursive: true })

  const executablePath = resolveChromeExecutablePath()
  const browser = await chromium.launch(executablePath ? { executablePath } : {})
  const results = []
  let basePort = Number(process.env.WEB_DEMO_COMPARE_PORT_START ?? 4500)

  try {
    for (const project of projects) {
      const cwd = path.join(webRoot, project)
      const webPort = basePort++
      const weappPort = basePort++
      const web = runServer(cwd, 'web', webPort)
      const weapp = runServer(cwd, 'weapp', weappPort)

      try {
        const webUrl = `http://127.0.0.1:${webPort}/`
        const weappUrl = `http://127.0.0.1:${weappPort}/`
        await Promise.all([
          waitForUrl(webUrl, web),
          waitForUrl(weappUrl, weapp),
        ])

        const page = await browser.newPage()
        const webData = await collectPage(page, webUrl, `${project}-web`)
        const weappData = await collectPage(page, weappUrl, `${project}-weapp`)
        await page.close()

        const allDiffs = diffObjects(webData, weappData)
        const styleDiffs = allDiffs.filter(diff => !diff.path.endsWith('.className'))
        const classDiffs = allDiffs.filter(diff => diff.path.endsWith('.className'))
        const screenshot = await compareScreenshots(project)

        results.push({
          project,
          styleDiffCount: styleDiffs.length,
          classDiffCount: classDiffs.length,
          styleDiffs,
          classDiffs,
          screenshot,
        })
      }
      finally {
        await Promise.all([stopServer(web), stopServer(weapp)])
      }
    }
  }
  finally {
    await browser.close()
  }

  const reportPath = path.join(outputDir, 'report.json')
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2))
  console.log(JSON.stringify({ outputDir, results }, null, 2))

  const failed = results.filter(result =>
    result.styleDiffCount > 0
    || result.classDiffCount > 0
    || result.screenshot.comparable !== true
    || result.screenshot.differentPixels > 0,
  )
  if (failed.length > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
