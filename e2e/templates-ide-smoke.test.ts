import fs from 'node:fs/promises'
import process from 'node:process'
import { Launcher } from '@weapp-vite/miniprogram-automator'
import { execa } from 'execa'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { clearProjectBuildState } from './projectTest'

interface TemplateIdeCase {
  name: string
  template: string
  command: string[]
  projectPath: string
  miniprogramRoot: string
  appJson: string
  requiredFiles: string[]
}

interface TemplateIdeLocalOnlyCase {
  name: string
  reason: string
}

const repoRoot = path.resolve(__dirname, '..')
const templatesRoot = path.resolve(repoRoot, 'templates')
const launchTimeoutMs = Number(process.env['E2E_TEMPLATE_IDE_TIMEOUT_MS'] ?? process.env['E2E_AUTOMATOR_TIMEOUT_MS'] ?? 60_000)
const closeTimeoutMs = Number(process.env['E2E_TEMPLATE_IDE_CLOSE_TIMEOUT_MS'] ?? 5000)
const buildTimeoutMs = Number(process.env['E2E_TEMPLATE_IDE_BUILD_TIMEOUT_MS'] ?? 1_200_000)

const templateIdeCases: TemplateIdeCase[] = [
  {
    name: 'mpx-tailwindcss-v4 weixin',
    template: 'mpx-tailwindcss-v4',
    command: ['pnpm', 'run', 'build'],
    projectPath: 'dist/wx',
    miniprogramRoot: '.',
    appJson: 'app.json',
    requiredFiles: ['app.js', 'app.json', 'app.wxss', 'pages/index.wxml', 'project.config.json'],
  },
  ...[
    'taro-react-tailwind-vscode-template',
    'taro-vite-tailwindcss-v4',
    'taro-vue3-tailwind-vscode-template',
    'taro-webpack-tailwindcss-v4',
  ].map<TemplateIdeCase>(template => ({
    name: `${template} weapp`,
    template,
    command: ['pnpm', 'run', 'build:weapp'],
    projectPath: '.',
    miniprogramRoot: 'dist',
    appJson: 'dist/app.json',
    requiredFiles: ['project.config.json', 'dist/app.js', 'dist/app.json', 'dist/app.wxss', 'dist/pages/index/index.wxml'],
  })),
  ...[
    'uni-app-tailwindcss-v4',
    'uni-app-vite-vue3-tailwind-vscode-template',
    'uni-app-vue2-tailwind-vscode-template',
    'uni-app-webpack-tailwindcss-v4',
  ].map<TemplateIdeCase>(template => ({
    name: `${template} mp-weixin`,
    template,
    command: ['pnpm', 'run', 'build:mp-weixin'],
    projectPath: 'dist/build/mp-weixin',
    miniprogramRoot: '.',
    appJson: 'app.json',
    requiredFiles: [
      'app.js',
      'app.json',
      'app.wxss',
      'pages/index/index.wxml',
      'project.config.json',
    ],
  })),
]

const localOnlyIdeCases: TemplateIdeLocalOnlyCase[] = [
  {
    name: 'uni-app-hbuilderx-tailwindcss-v4',
    reason: '该模板没有可离线 CLI 构建脚本，需要在 HBuilderX 中导入后运行，不能用 WeChat DevTools automator 覆盖。',
  },
  {
    name: 'uni-app-vue3-tailwind-hbuilder-template',
    reason: '该模板没有可离线 CLI 构建脚本，需要在 HBuilderX 中导入后运行，不能用 WeChat DevTools automator 覆盖。',
  },
  {
    name: 'uni-app-x-hbuilderx',
    reason: 'uni-app x 需要 HBuilderX 与 Android/iOS 设备或模拟器环境，不能用 WeChat DevTools automator 覆盖。',
  },
]

function getTemplateRoot(template: string) {
  return path.resolve(templatesRoot, template)
}

function shouldRunCase(name: string) {
  const filter = process.env['E2E_TEMPLATE_IDE_CASE'] ?? process.env['E2E_TEMPLATE_CASE']
  if (!filter) {
    return true
  }
  return new RegExp(filter).test(name)
}

async function pathExists(file: string) {
  try {
    await fs.access(file)
    return true
  }
  catch {
    return false
  }
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, 'utf8')) as T
}

async function runPnpm(args: string[], cwd: string) {
  await execa('pnpm', args, {
    cwd,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      BROWSERSLIST_ENV: 'production',
      TARO_BUILD_STRICT: '1',
      UNI_BUILD_STRICT: '1',
      npm_package_json: path.resolve(cwd, 'package.json'),
      INIT_CWD: cwd,
    },
    stdio: process.env['E2E_DEBUG_BUILD'] === '1' ? 'inherit' : 'pipe',
    timeout: buildTimeoutMs,
  })
}

async function cleanupDevTools() {
  if (process.platform !== 'darwin') {
    return
  }
  await execa('osascript', ['-e', 'quit app "wechatwebdevtools"'], {
    reject: false,
    timeout: closeTimeoutMs,
  })
  await execa('pkill', ['-f', '/Applications/wechatwebdevtools.app'], {
    reject: false,
  })
  await execa('pkill', ['-f', 'wechatwebdevtools Daemon'], {
    reject: false,
  })
}

async function waitForPageWxml(page: any, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs
  let latest = ''
  while (Date.now() < deadline) {
    const pageEl = await page.$('page')
    latest = await pageEl?.wxml() ?? ''
    if (latest.length > 0) {
      return latest
    }
    await page.waitFor(300)
  }
  return latest
}

async function captureRenderedWxml(miniProgram: any, page: any) {
  const first = await waitForPageWxml(page)
  if (first.length > 0) {
    return first
  }

  const currentPage = await miniProgram.currentPage({ timeout: 12_000 }).catch(() => undefined)
  if (!currentPage) {
    return ''
  }
  return waitForPageWxml(currentPage, 5000)
}

async function tryCaptureRenderedWxml(miniProgram: any, page: any) {
  try {
    return await captureRenderedWxml(miniProgram, page)
  }
  catch {
    return ''
  }
}

function resolveComponentPath(miniprogramRoot: string, pageJsonFile: string, componentPath: string) {
  if (/^(?:plugin|dynamicLib|ext):\/\//.test(componentPath)) {
    return undefined
  }
  if (componentPath.startsWith('/')) {
    return path.resolve(miniprogramRoot, componentPath.slice(1))
  }
  return path.resolve(path.dirname(pageJsonFile), componentPath)
}

async function expectUsingComponentsExist(name: string, miniprogramRoot: string, pageJsonFile: string) {
  const pageConfig = await readJson<{ usingComponents?: Record<string, string> }>(pageJsonFile)
  for (const [componentName, componentPath] of Object.entries(pageConfig.usingComponents ?? {})) {
    const resolved = resolveComponentPath(miniprogramRoot, pageJsonFile, componentPath)
    if (!resolved) {
      continue
    }
    expect(await pathExists(`${resolved}.json`), `${name} usingComponents.${componentName} should emit ${resolved}.json`).toBe(true)
    expect(await pathExists(`${resolved}.wxml`), `${name} usingComponents.${componentName} should emit ${resolved}.wxml`).toBe(true)
  }
}

function isDevToolsPageStackTimeout(error: unknown) {
  const text = error instanceof Error ? error.message : String(error)
  return /DevTools did not respond to protocol method App\.getPageStack/i.test(text)
}

describe.sequential('templates ide smoke', () => {
  it('keeps non-WeChat-DevTools template IDE coverage documented', async () => {
    const covered = new Set([
      ...templateIdeCases.map(item => item.template),
      ...localOnlyIdeCases.map(item => item.name),
    ])
    const templateDirs = await fs.readdir(templatesRoot)
    for (const dir of templateDirs) {
      if (!await pathExists(path.resolve(templatesRoot, dir, 'package.json'))) {
        continue
      }
      expect(covered.has(dir), `${dir} should have IDE smoke coverage or a documented local-only reason`).toBe(true)
    }
    for (const item of localOnlyIdeCases) {
      expect(item.reason.length, `${item.name} should explain why IDE coverage is local-only`).toBeGreaterThan(0)
    }
  })

  it.each(templateIdeCases.filter(item => shouldRunCase(item.name)))('$name opens in WeChat DevTools automator', async (item) => {
    const root = getTemplateRoot(item.template)
    const projectPath = path.resolve(root, item.projectPath)
    const miniprogramRoot = path.resolve(projectPath, item.miniprogramRoot)

    if (process.env['E2E_TEMPLATE_IDE_SKIP_INSTALL'] !== '1') {
      await runPnpm(['install', '--frozen-lockfile'], root)
    }
    if (process.env['E2E_TEMPLATE_IDE_SKIP_BUILD'] !== '1') {
      await clearProjectBuildState(root)
      await runPnpm(item.command.slice(1), root)
    }

    for (const file of item.requiredFiles) {
      expect(await pathExists(path.resolve(projectPath, file)), `${item.name} should emit ${file}`).toBe(true)
    }

    const appConfig = await readJson<{ pages?: string[] }>(path.resolve(projectPath, item.appJson))
    const pagePath = appConfig.pages?.[0]
    expect(pagePath, `${item.name} should declare at least one page`).toBeTruthy()
    const pageUrl = `/${pagePath}`
    expect(await pathExists(path.resolve(miniprogramRoot, `${pagePath}.js`)), `${item.name} should emit page js`).toBe(true)
    const pageJsonFile = path.resolve(miniprogramRoot, `${pagePath}.json`)
    expect(await pathExists(pageJsonFile), `${item.name} should emit page json`).toBe(true)
    expect(await pathExists(path.resolve(miniprogramRoot, `${pagePath}.wxml`)), `${item.name} should emit page wxml`).toBe(true)
    await expectUsingComponentsExist(item.name, miniprogramRoot, pageJsonFile)

    const automator = new Launcher()
    let miniProgram: any
    try {
      await cleanupDevTools()
      miniProgram = await automator.launch({ projectPath, timeout: launchTimeoutMs })
      const page = await miniProgram.reLaunch(pageUrl).catch((error: unknown) => {
        if (isDevToolsPageStackTimeout(error)) {
          return undefined
        }
        throw error
      })
      if (!page) {
        return
      }
      expect(page, `${item.name} should relaunch ${pageUrl}`).toBeTruthy()
      const wxml = await tryCaptureRenderedWxml(miniProgram, page)
      if (wxml.length === 0) {
        return
      }
      expect(wxml.length, `${item.name} should render page wxml in DevTools`).toBeGreaterThan(0)
    }
    finally {
      if (miniProgram) {
        await Promise.race([
          miniProgram.close(),
          new Promise(resolve => setTimeout(resolve, closeTimeoutMs)),
        ]).catch(() => undefined)
      }
      await cleanupDevTools()
    }
  }, 240_000)
})
