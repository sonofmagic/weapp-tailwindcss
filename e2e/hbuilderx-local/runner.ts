import type { AppCase, MiniProgramCase, WebCase } from './cases'

import fs from 'node:fs/promises'

import path from 'pathe'
import { expect } from 'vitest'
import { rawTailwindDirectiveRE } from './cases'
import {
  assertIosSimulatorToolchain,
  collectProcessOutput,
  fileExists,
  hbuilderxAppTimeoutMs,
  hbuilderxTimeoutMs,
  killProcessTree,
  pollIntervalMs,
  readUtf8,
  resolveHBuilderXCli,
  runPnpm,
  spawnPnpm,
  wait,
} from './process'
import { runWebHmr } from './web'

const repoRoot = path.resolve(__dirname, '../..')

function expectContent(source: string, entries: Array<string | RegExp>, label: string) {
  for (const entry of entries) {
    if (typeof entry === 'string') {
      expect(source, `${label} 应包含 ${entry}`).toContain(entry)
    }
    else {
      expect(source, `${label} 应匹配 ${entry}`).toMatch(entry)
    }
  }
}

function hasContent(source: string, entries: Array<string | RegExp>) {
  return entries.every((entry) => {
    if (typeof entry === 'string') {
      return source.includes(entry)
    }
    return entry.test(source)
  })
}

async function waitForFile(file: string, timeoutMs: number) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    if (await fileExists(file)) {
      return true
    }
    await wait(pollIntervalMs)
  }
  return false
}

async function resolveAppOutputRoot(item: AppCase) {
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  for (const outputDir of resolveAppOutputDirCandidates(item)) {
    const outputRoot = path.resolve(projectRoot, outputDir)
    const missing = await findMissingAppFiles(item, outputRoot)
    if (missing.length === 0) {
      return outputRoot
    }
  }
  return path.resolve(projectRoot, item.outputDir)
}

function resolveAppOutputDirCandidates(item: AppCase) {
  return item.outputDirCandidates?.length ? item.outputDirCandidates : [item.outputDir]
}

function resolveAppTransformedFiles(projectRoot: string, outputRoot: string, item: AppCase) {
  return [
    ...(item.transformedFiles ?? []).map(file => path.resolve(projectRoot, file)),
    ...(item.transformedOutputFiles ?? []).map(file => path.resolve(outputRoot, file)),
  ]
}

async function readAppTransformedOutput(projectRoot: string, outputRoot: string, item: AppCase) {
  return (await Promise.all(resolveAppTransformedFiles(projectRoot, outputRoot, item).map(async (target) => {
    const label = path.relative(projectRoot, target) || target
    expect(await waitForFile(target, hbuilderxAppTimeoutMs), `${item.name} 缺少转换产物 ${label}`).toBe(true)
    return await readUtf8(target)
  }))).join('\n')
}

async function readExistingAppTransformedOutput(projectRoot: string, outputRoot: string, item: AppCase) {
  const transformedFiles = resolveAppTransformedFiles(projectRoot, outputRoot, item)
  if (!(await Promise.all(transformedFiles.map(fileExists))).every(Boolean)) {
    return undefined
  }
  return (await Promise.all(transformedFiles.map(readUtf8))).join('\n')
}

async function assertMiniProgramOutput(item: MiniProgramCase) {
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  const outputRoot = path.resolve(projectRoot, item.outputDir)

  for (const file of item.requiredFiles) {
    const target = path.resolve(outputRoot, file)
    expect(await waitForFile(target, hbuilderxTimeoutMs), `${item.name} 缺少产物 ${file}`).toBe(true)
  }

  const css = (await Promise.all(item.cssFiles.map(async (file) => {
    const target = path.resolve(outputRoot, file)
    expect(await waitForFile(target, hbuilderxTimeoutMs), `${item.name} 缺少样式产物 ${file}`).toBe(true)
    return await readUtf8(target)
  }))).join('\n')

  expectContent(css, item.cssContains, item.name)
  if (item.cssNotContains) {
    for (const entry of item.cssNotContains) {
      if (typeof entry === 'string') {
        expect(css, `${item.name} 不应包含 ${entry}`).not.toContain(entry)
      }
      else {
        expect(css, `${item.name} 不应匹配 ${entry}`).not.toMatch(entry)
      }
    }
  }
}

async function assertAppOutput(item: AppCase) {
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  const outputRoot = await resolveAppOutputRoot(item)

  for (const file of item.requiredFiles) {
    const target = path.resolve(outputRoot, file)
    expect(await waitForFile(target, hbuilderxAppTimeoutMs), `${item.name} 缺少产物 ${file}`).toBe(true)
  }

  const transformed = await readAppTransformedOutput(projectRoot, outputRoot, item)
  expectContent(transformed, item.transformedContains, `${item.name} App 转换产物`)
}

async function findMissingAppFiles(item: AppCase, outputRoot?: string) {
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  const root = outputRoot ?? path.resolve(projectRoot, item.outputDir)
  const missing: string[] = []

  for (const file of item.requiredFiles) {
    if (!await fileExists(path.resolve(root, file))) {
      missing.push(file)
    }
  }

  return missing
}

async function findReadyAppOutputRoot(item: AppCase) {
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  for (const outputDir of resolveAppOutputDirCandidates(item)) {
    const outputRoot = path.resolve(projectRoot, outputDir)
    const missing = await findMissingAppFiles(item, outputRoot)
    if (missing.length > 0) {
      continue
    }
    const transformed = await readExistingAppTransformedOutput(projectRoot, outputRoot, item)
    if (transformed && hasContent(transformed, item.transformedContains)) {
      return outputRoot
    }
  }
  return undefined
}

async function cleanAppOutput(item: AppCase) {
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  const targets = [
    ...resolveAppOutputDirCandidates(item).map(outputDir => path.resolve(projectRoot, outputDir)),
    ...(item.transformedFiles ?? []).map(file => path.resolve(projectRoot, file)),
  ]

  await Promise.all([...new Set(targets)].map(async (target) => {
    await fs.rm(target, { recursive: true, force: true })
  }))
}

async function runAppLaunchUntilOutput(item: AppCase, hbuilderxCliPath: string, projectRoot: string) {
  const child = spawnPnpm(
    projectRoot,
    ['exec', 'hbuilderx', 'launch', item.platform, '--project', projectRoot, '--compile', 'true', ...(item.launchArgs ?? [])],
    {
      HBUILDERX_CLI_PATH: hbuilderxCliPath,
      WEAPP_TW_HMR_TIMING: '1',
      ...item.launchEnv,
    },
  )
  const logs = collectProcessOutput(child)
  const startedAt = Date.now()
  let exit: { code: number | null, signal: NodeJS.Signals | null } | undefined
  const closed = new Promise<void>((resolve) => {
    child.on('close', (code, signal) => {
      exit = { code, signal }
      resolve()
    })
  })

  while (Date.now() - startedAt < hbuilderxAppTimeoutMs) {
    if (await findReadyAppOutputRoot(item)) {
      killProcessTree(child)
      await Promise.race([closed, wait(5_000)])
      return
    }

    if (exit) {
      if (exit.code === 0) {
        break
      }
      throw new Error(`命令失败：pnpm exec hbuilderx launch ${item.platform} exit=${exit.signal ?? exit.code}\n${logs.join('')}`)
    }

    await wait(pollIntervalMs)
  }

  killProcessTree(child)
  await Promise.race([closed, wait(5_000)])
  await assertAppOutput(item)
}

async function mutateFile(file: string, anchor: string, insertion: string) {
  const original = await readUtf8(file)
  const index = original.indexOf(anchor)
  if (index < 0) {
    throw new Error(`找不到 App E2E 插入锚点：${file}`)
  }
  const next = `${original.slice(0, index)}${insertion}\n\t\t${original.slice(index)}`
  await fs.writeFile(file, next, 'utf8')
  return async () => {
    await fs.writeFile(file, original, 'utf8')
  }
}

export async function compileMiniProgramWithHBuilderX(item: MiniProgramCase) {
  const hbuilderxCliPath = await resolveHBuilderXCli()
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  await fs.rm(path.resolve(projectRoot, item.outputDir), { recursive: true, force: true })
  await runPnpm(
    projectRoot,
    ['exec', 'hbuilderx', 'project', 'open', '--path', projectRoot],
    hbuilderxTimeoutMs,
    {
      HBUILDERX_CLI_PATH: hbuilderxCliPath,
    },
  )
  await runPnpm(
    projectRoot,
    ['exec', 'hbuilderx', 'launch', 'mp-weixin', '--project', projectRoot, '--compile', 'true'],
    hbuilderxTimeoutMs,
    {
      HBUILDERX_CLI_PATH: hbuilderxCliPath,
      WEAPP_TW_HMR_TIMING: '1',
    },
  )
  await assertMiniProgramOutput(item)
}

export async function compileAppWithHBuilderX(item: AppCase) {
  if (item.platform === 'app-ios') {
    assertIosSimulatorToolchain()
  }

  const hbuilderxCliPath = await resolveHBuilderXCli()
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  let restore: (() => Promise<void>) | undefined
  try {
    restore = await mutateFile(
      path.resolve(projectRoot, item.sourceFile),
      item.markerAnchor,
      `<view class="${item.markerClass}">${item.markerText}</view>`,
    )
    await cleanAppOutput(item)
    await runPnpm(
      projectRoot,
      ['exec', 'hbuilderx', 'project', 'open', '--path', projectRoot],
      hbuilderxAppTimeoutMs,
      {
        HBUILDERX_CLI_PATH: hbuilderxCliPath,
      },
    )
    await runAppLaunchUntilOutput(item, hbuilderxCliPath, projectRoot)
    await assertAppOutput(item)
  }
  finally {
    if (restore) {
      await restore()
    }
  }
}

export async function verifyWebHmr(item: WebCase) {
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  const result = await runWebHmr(
    projectRoot,
    path.resolve(projectRoot, item.sourceFile),
    item.markerAnchor,
    item.initialCssPath,
    item.hmrCssPath,
    item.initialCssContains,
    item.hmrSteps,
  )

  expect(result.pageHtml, `${item.name} Web 首页应可访问`).toContain('<!DOCTYPE html>')
  expect(result.initialCss, `${item.name} 不应保留 Tailwind 原始指令`).not.toMatch(rawTailwindDirectiveRE)
  for (const css of result.hmrCss) {
    expect(css, `${item.name} HMR CSS 不应保留 Tailwind 原始指令`).not.toMatch(rawTailwindDirectiveRE)
  }
}
