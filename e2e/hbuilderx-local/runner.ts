import type { AppCase, MiniProgramCase, WebCase } from './cases'

import fs from 'node:fs/promises'

import path from 'pathe'
import { expect } from 'vitest'
import { rawTailwindDirectiveRE } from './cases'
import {
  assertAndroidToolchain,
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

function resolveAppMarkerAnchors(item: AppCase) {
  return item.markerAnchorCandidates?.length ? item.markerAnchorCandidates : [item.markerAnchor]
}

function resolveWebMarkerAnchors(item: WebCase) {
  return item.markerAnchorCandidates?.length ? item.markerAnchorCandidates : [item.markerAnchor]
}

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

function resolveAppIntermediateOutputTargets(item: AppCase, projectRoot: string) {
  const targets = new Set<string>()
  if (item.platform === 'app-android' || item.platform === 'app-ios') {
    targets.add(path.resolve(projectRoot, `unpackage/dist/dev/.uvue/${item.platform}`))
    targets.add(path.resolve(projectRoot, `unpackage/cache/.${item.platform}`))
  }
  return [...targets]
}

function resolveAppTransformedFiles(projectRoot: string, outputRoot: string, item: AppCase) {
  return [...(item.transformedFiles ?? []).map(file => path.resolve(projectRoot, file)), ...(item.transformedOutputFiles ?? []).map(file => path.resolve(outputRoot, file))]
}

async function readAppTransformedOutput(projectRoot: string, outputRoot: string, item: AppCase) {
  return (
    await Promise.all(
      resolveAppTransformedFiles(projectRoot, outputRoot, item).map(async (target) => {
        const label = path.relative(projectRoot, target) || target
        expect(await waitForFile(target, hbuilderxAppTimeoutMs), `${item.name} 缺少转换产物 ${label}`).toBe(true)
        return await readUtf8(target)
      }),
    )
  ).join('\n')
}

async function readExistingAppTransformedOutput(projectRoot: string, outputRoot: string, item: AppCase) {
  const transformedFiles = resolveAppTransformedFiles(projectRoot, outputRoot, item)
  if (!(await Promise.all(transformedFiles.map(fileExists))).every(Boolean)) {
    return undefined
  }
  return (await Promise.all(transformedFiles.map(readUtf8))).join('\n')
}

async function waitForAppTransformedContent(item: AppCase, expected: Array<string | RegExp>, timeoutMs: number, ensureRunning?: () => void) {
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  const startedAt = Date.now()
  let latest = ''

  while (Date.now() - startedAt < timeoutMs) {
    ensureRunning?.()
    for (const outputDir of resolveAppOutputDirCandidates(item)) {
      const outputRoot = path.resolve(projectRoot, outputDir)
      const transformed = await readExistingAppTransformedOutput(projectRoot, outputRoot, item)
      if (!transformed) {
        continue
      }
      latest = transformed
      if (hasContent(transformed, expected)) {
        return outputRoot
      }
    }
    await wait(pollIntervalMs)
  }

  throw new Error(`${item.name} App 热更新产物未包含预期内容\nexpected=${expected.map(String).join(' | ')}\nlatest=${latest.slice(0, 2000)}`)
}

async function assertMiniProgramOutput(item: MiniProgramCase) {
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  let outputRoot = path.resolve(projectRoot, item.outputDir)
  for (const outputDir of item.outputDirCandidates ?? [item.outputDir]) {
    const candidateRoot = path.resolve(projectRoot, outputDir)
    const ready = await Promise.all(item.requiredFiles.map(file => fileExists(path.resolve(candidateRoot, file))))
    if (ready.every(Boolean)) {
      outputRoot = candidateRoot
      break
    }
  }

  for (const file of item.requiredFiles) {
    const target = path.resolve(outputRoot, file)
    expect(await waitForFile(target, hbuilderxTimeoutMs), `${item.name} 缺少产物 ${file}`).toBe(true)
  }

  const css = (
    await Promise.all(
      item.cssFiles.map(async (file) => {
        const target = path.resolve(outputRoot, file)
        expect(await waitForFile(target, hbuilderxTimeoutMs), `${item.name} 缺少样式产物 ${file}`).toBe(true)
        return await readUtf8(target)
      }),
    )
  ).join('\n')

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
    if (!(await fileExists(path.resolve(root, file)))) {
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
    ...resolveAppIntermediateOutputTargets(item, projectRoot),
    ...(item.transformedFiles ?? []).map(file => path.resolve(projectRoot, file)),
  ]

  await Promise.all(
    [...new Set(targets)].map(async (target) => {
      await fs.rm(target, { recursive: true, force: true })
    }),
  )
}

async function writeAppMarker(
  file: string,
  anchors: string[],
  marker: {
    className: string
    text: string
  },
) {
  const source = await readUtf8(file)
  const cleaned = source.replace(/\n[ \t]*<view class="[^"]+">hbuilderx-app-(?:dynamic|hmr)-[^<]+<\/view>/g, '')
  const anchor = anchors.find(item => cleaned.includes(item))
  const index = anchor ? cleaned.indexOf(anchor) : -1
  if (index < 0) {
    throw new Error(`找不到 App E2E 插入锚点：${file}`)
  }
  const next = `${cleaned.slice(0, index)}<view class="${marker.className}">${marker.text}</view>\n\t\t${cleaned.slice(index)}`
  await fs.writeFile(file, next, 'utf8')
}

export async function compileMiniProgramWithHBuilderX(item: MiniProgramCase) {
  const hbuilderxCliPath = await resolveHBuilderXCli()
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  const projectName = path.basename(projectRoot)
  const outputDirs = item.outputDirCandidates ?? [item.outputDir]
  await Promise.all(
    [...new Set(outputDirs)].map(async (outputDir) => {
      await fs.rm(path.resolve(projectRoot, outputDir), { recursive: true, force: true })
    }),
  )
  await runPnpm(projectRoot, ['exec', 'hbuilderx', 'project', 'open', '--path', projectRoot], hbuilderxTimeoutMs, {
    HBUILDERX_CLI_PATH: hbuilderxCliPath,
  })
  await runPnpm(projectRoot, ['exec', 'hbuilderx', 'launch', 'mp-weixin', '--project', projectName, '--compile', 'true'], hbuilderxTimeoutMs, {
    HBUILDERX_CLI_PATH: hbuilderxCliPath,
    WEAPP_TW_HMR_TIMING: '1',
  })
  await assertMiniProgramOutput(item)
}

export async function verifyAppHmrWithHBuilderX(item: AppCase) {
  let androidEnv: Record<string, string> | undefined
  if (item.platform === 'app-android') {
    androidEnv = assertAndroidToolchain()
  }
  if (item.platform === 'app-ios') {
    assertIosSimulatorToolchain()
  }

  const hbuilderxCliPath = await resolveHBuilderXCli()
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  const projectName = path.basename(projectRoot)
  const sourceFile = path.resolve(projectRoot, item.sourceFile)
  let restore: (() => Promise<void>) | undefined
  let child: ReturnType<typeof spawnPnpm> | undefined
  try {
    const original = await readUtf8(sourceFile)
    restore = async () => {
      await fs.writeFile(sourceFile, original, 'utf8')
    }
    await writeAppMarker(sourceFile, resolveAppMarkerAnchors(item), {
      className: item.markerClass,
      text: item.markerText,
    })
    await cleanAppOutput(item)
    await runPnpm(projectRoot, ['exec', 'hbuilderx', 'project', 'open', '--path', projectRoot], hbuilderxAppTimeoutMs, {
      HBUILDERX_CLI_PATH: hbuilderxCliPath,
      ...androidEnv,
    })
    child = spawnPnpm(projectRoot, ['exec', 'hbuilderx', 'launch', item.platform, '--project', projectName, ...(item.launchArgs ?? [])], {
      HBUILDERX_CLI_PATH: hbuilderxCliPath,
      WEAPP_TW_HMR_TIMING: '1',
      ...androidEnv,
      ...item.launchEnv,
    })
    const logs = collectProcessOutput(child)
    let exit: { code: number | null, signal: NodeJS.Signals | null } | undefined
    const closed = new Promise<void>((resolve) => {
      child?.on('close', (code, signal) => {
        exit = { code, signal }
        resolve()
      })
    })

    const startedAt = Date.now()
    const ensureLaunchRunning = () => {
      if (exit && exit.code !== 0) {
        throw new Error(`命令失败：pnpm exec hbuilderx launch ${item.platform} exit=${exit.signal ?? exit.code}\n${logs.join('')}`)
      }
    }
    let initialOutputRoot: string | undefined
    while (Date.now() - startedAt < hbuilderxAppTimeoutMs) {
      initialOutputRoot = await findReadyAppOutputRoot(item)
      if (initialOutputRoot) {
        break
      }
      ensureLaunchRunning()
      await wait(pollIntervalMs)
    }
    if (!initialOutputRoot) {
      throw new Error(`${item.name} App 初始开发产物未在 ${hbuilderxAppTimeoutMs}ms 内就绪\n${logs.join('')}`)
    }

    await assertAppOutput(item)
    if (exit) {
      throw new Error(`HBuilderX app dev process exited before hot-update mutation: exit=${exit.signal ?? exit.code}\n${logs.join('')}`)
    }
    await writeAppMarker(sourceFile, resolveAppMarkerAnchors(item), {
      className: item.hmrMarkerClass,
      text: item.hmrMarkerText,
    })
    await waitForAppTransformedContent(item, item.hmrTransformedContains, hbuilderxAppTimeoutMs, ensureLaunchRunning)

    killProcessTree(child)
    await Promise.race([closed, wait(5_000)])
    child = undefined
  }
  finally {
    if (child) {
      killProcessTree(child)
    }
    if (restore) {
      await restore()
    }
  }
}

export async function verifyWebHmr(item: WebCase) {
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  const result = await runWebHmr(projectRoot, path.resolve(projectRoot, item.sourceFile), resolveWebMarkerAnchors(item), item.initialCssPath, item.hmrCssPath, item.initialCssContains, item.initialRuntimeStyles, item.hmrSteps)

  expect(result.pageHtml, `${item.name} Web 首页应可访问`).toContain('<!DOCTYPE html>')
  expect(result.initialCss, `${item.name} 不应保留 Tailwind 原始指令`).not.toMatch(rawTailwindDirectiveRE)
  for (const css of result.hmrCss) {
    expect(css, `${item.name} HMR CSS 不应保留 Tailwind 原始指令`).not.toMatch(rawTailwindDirectiveRE)
  }
}
