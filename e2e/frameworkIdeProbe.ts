import fs from 'node:fs/promises'
import process from 'node:process'
import { Launcher } from '@weapp-vite/miniprogram-automator'
import path from 'pathe'
import { collectFrameworkIdeDiagnostics } from './frameworkIdeDiagnostics'
import { runFrameworkIdeHotUpdateProbe } from './frameworkIdeHotUpdate'
import { installFrameworkIdeRuntimeErrorCollector } from './frameworkIdeRuntimeErrors'
import { FRAMEWORK_SUPPORT_CASES } from './frameworkSupportMatrix'
import { resolveFrameworkSupportPaths } from './frameworkSupportPaths'

const caseName = process.argv[2]
const timeoutMs = Number(process.env['E2E_IDE_PROBE_TIMEOUT_MS'] ?? process.env['E2E_AUTOMATOR_TIMEOUT_MS'] ?? 30_000)
const relaunchTimeoutMs = Number(process.env['E2E_IDE_RELAUNCH_TIMEOUT_MS'] ?? timeoutMs)
const closeTimeoutMs = Number(process.env['E2E_IDE_CLOSE_TIMEOUT_MS'] ?? 10_000)

if (!caseName) {
  throw new Error('Missing framework support case name.')
}
const supportCaseName = caseName

const entry = FRAMEWORK_SUPPORT_CASES.find(item => item.name === supportCaseName)
if (!entry) {
  throw new Error(`Unknown framework support case: ${supportCaseName}`)
}
if (entry.ide.tier !== 'required') {
  throw new Error(`Framework support case does not require IDE probe: ${supportCaseName}`)
}

const supportEntry = entry
const { appJsonPath, miniprogramRoot, projectPath, root } = resolveFrameworkSupportPaths(supportEntry)
let miniProgram: any
const projectConfigPath = path.resolve(projectPath, 'project.config.json')
let projectConfigOriginal: string | undefined

function shouldRunHotUpdateProbe() {
  return process.env['E2E_IDE_HOT_UPDATE'] !== '0'
}

async function snapshotProjectConfig() {
  try {
    projectConfigOriginal = await fs.readFile(projectConfigPath, 'utf8')
  }
  catch {
    projectConfigOriginal = undefined
  }
}

async function restoreProjectConfig() {
  if (projectConfigOriginal == null) {
    return
  }
  try {
    await fs.writeFile(projectConfigPath, projectConfigOriginal)
  }
  catch (error) {
    process.stderr.write(`Framework IDE probe failed to restore project.config.json for ${supportCaseName}: ${String(error)}\n`)
  }
}

async function ensureMiniProgramEntry() {
  let appConfig: { pages?: string[] }
  try {
    appConfig = JSON.parse(await fs.readFile(appJsonPath, 'utf8'))
  }
  catch {
    throw new Error(`Failed to read app.json for ${supportCaseName}: ${appJsonPath}`)
  }

  const defaultPage = appConfig.pages?.[0]
  if (!defaultPage) {
    throw new Error(`app.json does not declare any pages for ${supportCaseName}`)
  }

  const url = supportEntry.project.url ?? `/${defaultPage}`
  const pagePath = url.replace(/^\//, '')
  if (!appConfig.pages?.includes(pagePath)) {
    throw new Error(`app.json does not declare ${url} for ${supportCaseName}: ${JSON.stringify(appConfig.pages ?? [])}`)
  }

  for (const ext of ['.js', '.json', '.wxml']) {
    const filePath = path.resolve(miniprogramRoot, `${pagePath}${ext}`)
    try {
      await fs.access(filePath)
    }
    catch {
      throw new Error(`Missing page artifact for ${supportCaseName}: ${filePath}`)
    }
  }

  return url
}

async function withStageTimeout<T>(stage: string, task: Promise<T>, stageTimeoutMs = timeoutMs) {
  let stageTimer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      task,
      new Promise<T>((_, reject) => {
        stageTimer = setTimeout(() => {
          reject(new Error(`Framework IDE probe ${stage} timed out after ${stageTimeoutMs}ms: ${supportCaseName}`))
        }, stageTimeoutMs)
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
    process.stderr.write(`Framework IDE probe close failed for ${supportCaseName}: ${String(error)}\n`)
  }
}

async function main() {
  if (process.env['E2E_IDE_BUILD'] === '1') {
    const { ensureProjectBuilt } = await import('./projectBuild')
    await ensureProjectBuilt(root)
  }

  const pageUrl = await ensureMiniProgramEntry()
  const automator = new Launcher()
  const launchProjectPath = projectPath
  await snapshotProjectConfig()

  try {
    miniProgram = await withStageTimeout('launch', automator.launch({ projectPath: launchProjectPath, timeout: timeoutMs }))
    const runtimeErrors = await installFrameworkIdeRuntimeErrorCollector(supportCaseName, miniProgram)
    await runtimeErrors.assertNoErrors('launch')

    const page: any = await withStageTimeout('reLaunch', miniProgram.reLaunch(pageUrl), relaunchTimeoutMs)
    if (!page) {
      throw new Error(`Failed to relaunch page for ${supportCaseName}`)
    }
    await runtimeErrors.assertNoErrors('reLaunch')

    const currentPage = await withStageTimeout('currentPage', miniProgram.currentPage({ timeout: timeoutMs }).catch(() => page))
    if (!currentPage) {
      throw new Error(`Failed to resolve current page for ${supportCaseName}`)
    }

    if (shouldRunHotUpdateProbe()) {
      await runFrameworkIdeHotUpdateProbe(supportEntry, miniProgram, page, pageUrl, launchProjectPath, runtimeErrors)
    }
    await runtimeErrors.assertNoErrors('probe complete')
  }
  finally {
    await closeMiniProgram()
    await restoreProjectConfig()
  }
}

main().then(() => {
  process.exit(0)
}).catch(async (error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  await closeMiniProgram()
  await restoreProjectConfig()
  try {
    process.stderr.write(`${await collectFrameworkIdeDiagnostics(supportCaseName)}\n`)
  }
  catch (diagnosticError) {
    process.stderr.write(`[e2e:ide] failed to collect diagnostics: ${diagnosticError instanceof Error ? diagnosticError.stack : String(diagnosticError)}\n`)
  }
  process.exit(1)
})
