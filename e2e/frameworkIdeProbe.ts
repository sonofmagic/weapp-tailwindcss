import fs from 'node:fs/promises'
import process from 'node:process'
import { Launcher } from '@weapp-vite/miniprogram-automator'
import path from 'pathe'
import { runFrameworkIdeHotUpdateProbe } from './frameworkIdeHotUpdate'
import { FRAMEWORK_SUPPORT_CASES } from './frameworkSupportMatrix'
import { resolveFrameworkSupportPaths } from './frameworkSupportPaths'

const caseName = process.argv[2]
const timeoutMs = Number(process.env['E2E_IDE_PROBE_TIMEOUT_MS'] ?? process.env['E2E_AUTOMATOR_TIMEOUT_MS'] ?? 30_000)
const closeTimeoutMs = Number(process.env['E2E_IDE_CLOSE_TIMEOUT_MS'] ?? 10_000)

if (!caseName) {
  throw new Error('Missing framework support case name.')
}

const entry = FRAMEWORK_SUPPORT_CASES.find(item => item.name === caseName)
if (!entry) {
  throw new Error(`Unknown framework support case: ${caseName}`)
}
if (entry.ide.tier !== 'required') {
  throw new Error(`Framework support case does not require IDE probe: ${caseName}`)
}

const supportEntry = entry
const { appJsonPath, miniprogramRoot, projectPath, root } = resolveFrameworkSupportPaths(supportEntry)
let miniProgram: any

function shouldRunHotUpdateProbe() {
  return process.env['E2E_IDE_HOT_UPDATE'] !== '0'
}

async function ensureMiniProgramEntry() {
  let appConfig: { pages?: string[] }
  try {
    appConfig = JSON.parse(await fs.readFile(appJsonPath, 'utf8'))
  }
  catch {
    throw new Error(`Failed to read app.json for ${caseName}: ${appJsonPath}`)
  }

  const defaultPage = appConfig.pages?.[0]
  if (!defaultPage) {
    throw new Error(`app.json does not declare any pages for ${caseName}`)
  }

  const url = supportEntry.project.url ?? `/${defaultPage}`
  const pagePath = url.replace(/^\//, '')
  if (!appConfig.pages?.includes(pagePath)) {
    throw new Error(`app.json does not declare ${url} for ${caseName}: ${JSON.stringify(appConfig.pages ?? [])}`)
  }

  for (const ext of ['.js', '.json', '.wxml']) {
    const filePath = path.resolve(miniprogramRoot, `${pagePath}${ext}`)
    try {
      await fs.access(filePath)
    }
    catch {
      throw new Error(`Missing page artifact for ${caseName}: ${filePath}`)
    }
  }

  return url
}

async function withStageTimeout<T>(stage: string, task: Promise<T>) {
  let stageTimer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      task,
      new Promise<T>((_, reject) => {
        stageTimer = setTimeout(() => {
          reject(new Error(`Framework IDE probe ${stage} timed out after ${timeoutMs}ms: ${caseName}`))
        }, timeoutMs)
      }),
    ])
  }
  finally {
    if (stageTimer) {
      clearTimeout(stageTimer)
    }
  }
}

async function closeMiniProgram() {
  if (!miniProgram) {
    return
  }
  try {
    await Promise.race([
      miniProgram.close(),
      new Promise<void>((resolve) => {
        setTimeout(resolve, closeTimeoutMs)
      }),
    ])
  }
  catch (error) {
    process.stderr.write(`Framework IDE probe close failed for ${caseName}: ${String(error)}\n`)
  }
}

async function main() {
  if (process.env['E2E_IDE_BUILD'] === '1') {
    const { ensureProjectBuilt } = await import('./projectBuild')
    await ensureProjectBuilt(root)
  }

  const pageUrl = await ensureMiniProgramEntry()
  const automator = new Launcher()
  const launchProjectPath = shouldRunHotUpdateProbe() ? miniprogramRoot : projectPath

  try {
    miniProgram = await withStageTimeout('launch', automator.launch({ projectPath: launchProjectPath, timeout: timeoutMs }))

    const page: any = await withStageTimeout('reLaunch', miniProgram.reLaunch(pageUrl))
    if (!page) {
      throw new Error(`Failed to relaunch page for ${caseName}`)
    }

    const pageRoot: any = await withStageTimeout('query page root', page.$('page'))
    const wxml = await withStageTimeout('read page wxml', pageRoot?.wxml())
    if (typeof wxml !== 'string' || wxml.trim().length === 0) {
      throw new Error(`Empty page WXML for ${caseName}`)
    }

    if (shouldRunHotUpdateProbe()) {
      await runFrameworkIdeHotUpdateProbe(supportEntry, miniProgram, page, pageUrl, launchProjectPath)
    }
  }
  finally {
    await closeMiniProgram()
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  process.exitCode = 1
})
