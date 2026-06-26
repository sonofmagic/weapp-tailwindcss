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
const { PNG } = require('pngjs')

const outputDir = process.env.WEB_DEMO_COMPARE_OUTPUT
  ? path.resolve(process.env.WEB_DEMO_COMPARE_OUTPUT)
  : path.join(webRoot, '.compare-dev-weapp')

const projects = [
  {
    name: 'react-vite-tailwindcss-v4',
    devCommand: port => ['exec', 'vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    cssDevPath: '/src/style.css',
  },
  {
    name: 'vue-vite-tailwindcss-v4',
    devCommand: port => ['exec', 'vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    cssDevPath: '/src/style.css',
  },
  {
    name: 'react-rsbuild-tailwindcss-v4',
    devCommand: port => ['exec', 'rsbuild', 'dev', '--host', '127.0.0.1', '--port', String(port)],
  },
  {
    name: 'vue-rsbuild-tailwindcss-v4',
    devCommand: port => ['exec', 'rsbuild', 'dev', '--host', '127.0.0.1', '--port', String(port)],
  },
  {
    name: 'react-webpack-tailwindcss-v4',
    devCommand: port => ['exec', 'webpack', 'serve', '--mode', 'development', '--host', '127.0.0.1', '--port', String(port)],
  },
  {
    name: 'vue-webpack-tailwindcss-v4',
    devCommand: port => ['exec', 'webpack', 'serve', '--mode', 'development', '--host', '127.0.0.1', '--port', String(port)],
  },
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

function runPnpm(cwd, args, env = {}) {
  const child = spawn('pnpm', args, {
    cwd,
    env: {
      ...process.env,
      ...env,
      NODE_OPTIONS: process.env.NODE_OPTIONS ?? '--max-old-space-size=8192',
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

function runServer(project, cwd, target, port) {
  return runPnpm(cwd, project.devCommand(port), target === 'weapp' ? { WEAPP_TW_TARGET: 'weapp' } : {})
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
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await page.waitForSelector('main', { timeout: 60_000 })
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

async function fetchText(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }
  return response.text()
}

function decodeViteCssModule(source, url) {
  const match = source.match(/const __vite__css = "((?:\\.|[^"\\])*)"/)
  if (!match) {
    throw new Error(`failed to decode Vite CSS module: ${url}`)
  }

  return JSON.parse(`"${match[1]}"`)
}

async function findCssUrls(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('link[rel="stylesheet"]')]
      .map(link => link.href)
      .filter(Boolean),
  )
}

async function collectStylesheetCss(page) {
  const urls = await findCssUrls(page)
  const texts = await Promise.all(urls.map(async (url) => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`failed to fetch stylesheet ${url}: ${response.status} ${response.statusText}`)
    }
    return response.text()
  }))
  return {
    url: urls.join(', '),
    css: texts.join('\n'),
  }
}

async function collectGeneratedCssForProject(project, page, url) {
  if (project.cssDevPath) {
    const styleUrl = new URL(project.cssDevPath, url).toString()
    const moduleSource = await fetchText(styleUrl)
    return {
      url: styleUrl,
      css: decodeViteCssModule(moduleSource, styleUrl),
    }
  }
  return collectStylesheetCss(page)
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

function runChecks(checks) {
  return checks.map(({ name, pass, details }) => ({
    name,
    pass: Boolean(pass),
    ...(details ? { details } : {}),
  }))
}

function createWebRenderChecks(data) {
  return runChecks([
    {
      name: 'main renders a non-transparent background',
      pass: data.main?.backgroundColor && data.main.backgroundColor !== 'rgba(0, 0, 0, 0)',
      details: data.main?.backgroundColor,
    },
    {
      name: 'section uses grid layout',
      pass: data.section?.display === 'grid',
      details: data.section?.display,
    },
    {
      name: 'responsive swatch grid has four columns at desktop width',
      pass: data.swatchGrid?.gridTemplateColumns?.split(' ').length === 4,
      details: data.swatchGrid?.gridTemplateColumns,
    },
    {
      name: 'arbitrary value gradient renders',
      pass: data.arbitraryBox?.backgroundImage?.includes('linear-gradient'),
      details: data.arbitraryBox?.backgroundImage,
    },
    {
      name: 'decimal arbitrary opacity renders',
      pass: data.decimal?.opacity === '0.82',
      details: data.decimal?.opacity,
    },
    {
      name: 'variant pseudo content renders',
      pass: data.swatches.every(swatch => swatch?.beforeContent && swatch.beforeContent !== 'none'),
      details: data.swatches.map(swatch => swatch?.beforeContent).join(', '),
    },
  ])
}

function createWeappCssChecks(css) {
  const hasRawArbitrarySelector = css.split(/[,{]/).some(part => part.trimStart().startsWith('.') && part.includes('['))
  return runChecks([
    {
      name: 'contains normal utility selector',
      pass: /\.p-6\s*\{/.test(css),
    },
    {
      name: 'contains responsive utility selector',
      pass: /\.md_cgrid-cols-4\s*\{/.test(css),
    },
    {
      name: 'contains escaped hex arbitrary selector',
      pass: /\.bg-_b_h123456_B\s*\{/.test(css),
    },
    {
      name: 'contains escaped arbitrary property selector',
      pass: /\._bbox-shadow_c0_2_d5px_7_d5px_rgba_p18_m52_m86_m0_d35_P_B\s*\{/.test(css),
    },
    {
      name: 'contains escaped decimal arbitrary radius selector',
      pass: /\.rounded-_b18_d5px_B\s*\{/.test(css),
    },
    {
      name: 'contains escaped important decimal padding selector',
      pass: /\._ep-_b18_d5px_B\s*\{/.test(css),
    },
    {
      name: 'does not emit raw arbitrary selectors',
      pass: !hasRawArbitrarySelector,
    },
    {
      name: 'does not leave Tailwind directives uncompiled',
      pass: !/@(?:tailwind|source|import)\b/.test(css),
    },
  ])
}

function summarizeChecks(checks) {
  return {
    failedCount: checks.filter(check => !check.pass).length,
    checks,
  }
}

async function compareScreenshots(webPath, weappPath, diffPath) {
  const { default: pixelmatch } = await import('pixelmatch')
  const web = PNG.sync.read(await fs.readFile(webPath))
  const weapp = PNG.sync.read(await fs.readFile(weappPath))
  const maxDiffRatio = Number(process.env.WEB_DEMO_COMPARE_MAX_DIFF_RATIO ?? 0.02)
  const sameSize = web.width === weapp.width && web.height === weapp.height
  if (!sameSize) {
    return {
      pass: false,
      maxDiffRatio,
      width: web.width,
      height: web.height,
      weappWidth: weapp.width,
      weappHeight: weapp.height,
      diffPixels: null,
      diffRatio: null,
      diffPath,
    }
  }

  const diff = new PNG({ width: web.width, height: web.height })
  const diffPixels = pixelmatch(web.data, weapp.data, diff.data, web.width, web.height, {
    threshold: 0.1,
  })
  const diffRatio = diffPixels / (web.width * web.height)
  await fs.writeFile(diffPath, PNG.sync.write(diff))
  return {
    pass: diffRatio <= maxDiffRatio,
    maxDiffRatio,
    width: web.width,
    height: web.height,
    diffPixels,
    diffRatio,
    diffPath,
  }
}

function createVisualParityChecks(screenshotDiff, styleDiffs, classDiffs) {
  return summarizeChecks(runChecks([
    {
      name: 'web and weapp screenshots are visually equivalent',
      pass: screenshotDiff.pass,
      details: screenshotDiff.pass
        ? `${screenshotDiff.diffPixels} diff pixels within ratio ${screenshotDiff.maxDiffRatio}`
        : `${screenshotDiff.diffPixels ?? 'size mismatch'} diff pixels, ratio=${screenshotDiff.diffRatio ?? 'n/a'}, limit=${screenshotDiff.maxDiffRatio}, diff=${screenshotDiff.diffPath}`,
    },
    {
      name: 'computed style/class diagnostics collected',
      pass: true,
      details: `${styleDiffs.length} style/layout diffs, ${classDiffs.length} class diffs`,
    },
  ]))
}

async function runBuild(project, cwd, target) {
  const startedAt = Date.now()
  const script = target === 'weapp' ? 'build:weapp' : 'build:web'
  const child = runPnpm(cwd, ['run', script])
  await new Promise((resolve, reject) => {
    child.child.once('exit', (code) => {
      if (code === 0) {
        resolve(undefined)
        return
      }
      reject(new Error(`${project.name} ${script} failed with exit ${code}\n${child.logs()}`))
    })
    child.child.once('error', reject)
  })
  return {
    target,
    script,
    durationMs: Date.now() - startedAt,
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
      const cwd = path.join(webRoot, project.name)
      const webPort = basePort++
      const weappPort = basePort++
      const web = runServer(project, cwd, 'web', webPort)
      const weapp = runServer(project, cwd, 'weapp', weappPort)

      try {
        const webUrl = `http://127.0.0.1:${webPort}/`
        const weappUrl = `http://127.0.0.1:${weappPort}/`
        await Promise.all([
          waitForUrl(webUrl, web),
          waitForUrl(weappUrl, weapp),
        ])

        const page = await browser.newPage()
        const webData = await collectPage(page, webUrl, `${project.name}-web`)
        const weappData = await collectPage(page, weappUrl, `${project.name}-weapp`)
        const weappCss = await collectGeneratedCssForProject(project, page, weappUrl)
        await page.close()

        const allDiffs = diffObjects(webData, weappData)
        const styleDiffs = allDiffs.filter(diff => !diff.path.endsWith('.className'))
        const classDiffs = allDiffs.filter(diff => diff.path.endsWith('.className'))
        const screenshots = {
          web: path.join(outputDir, `${project.name}-web.png`),
          weapp: path.join(outputDir, `${project.name}-weapp.png`),
          diff: path.join(outputDir, `${project.name}-diff.png`),
        }
        const screenshotDiff = await compareScreenshots(screenshots.web, screenshots.weapp, screenshots.diff)
        const parity = createVisualParityChecks(screenshotDiff, styleDiffs, classDiffs)
        const webRender = summarizeChecks(createWebRenderChecks(webData))
        const weappCssChecks = summarizeChecks(createWeappCssChecks(weappCss.css))

        const builds = [
          await runBuild(project, cwd, 'web'),
          await runBuild(project, cwd, 'weapp'),
        ]

        results.push({
          project: project.name,
          webRender,
          parity,
          weappCss: {
            url: weappCss.url,
            size: weappCss.css.length,
            ...weappCssChecks,
          },
          styleDiffCount: styleDiffs.length,
          classDiffCount: classDiffs.length,
          screenshotDiff,
          styleDiffs,
          classDiffs,
          screenshots,
          builds,
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
    result.webRender.failedCount > 0
    || result.parity.failedCount > 0
    || result.weappCss.failedCount > 0,
  )
  if (failed.length > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
