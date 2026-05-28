import type { MiniProgramCase, WebCase } from './cases'

import fs from 'node:fs/promises'

import path from 'pathe'
import { expect } from 'vitest'
import { rawTailwindDirectiveRE } from './cases'
import {
  fileExists,
  hbuilderxTimeoutMs,
  readUtf8,
  resolveHBuilderXCli,
  runPnpm,
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

async function assertMiniProgramOutput(item: MiniProgramCase) {
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  const outputRoot = path.resolve(projectRoot, item.outputDir)

  for (const file of item.requiredFiles) {
    const target = path.resolve(outputRoot, file)
    expect(await fileExists(target), `${item.name} 缺少产物 ${file}`).toBe(true)
  }

  const css = (await Promise.all(item.cssFiles.map(async (file) => {
    const target = path.resolve(outputRoot, file)
    expect(await fileExists(target), `${item.name} 缺少样式产物 ${file}`).toBe(true)
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

export async function compileMiniProgramWithHBuilderX(item: MiniProgramCase) {
  const hbuilderxCliPath = await resolveHBuilderXCli()
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  await fs.rm(path.resolve(projectRoot, item.outputDir), { recursive: true, force: true })
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

export async function verifyWebHmr(item: WebCase) {
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  const result = await runWebHmr(
    projectRoot,
    path.resolve(projectRoot, item.sourceFile),
    item.markerAnchor,
    item.markerClass,
    item.markerText,
    item.initialCssPath,
    item.hmrCssPath,
    item.initialCssContains,
    item.hmrCssContains,
  )

  expect(result.pageHtml, `${item.name} Web 首页应可访问`).toContain('<!DOCTYPE html>')
  expect(result.initialCss, `${item.name} 不应保留 Tailwind 原始指令`).not.toMatch(rawTailwindDirectiveRE)
  expect(result.hmrCss, `${item.name} HMR CSS 不应保留 Tailwind 原始指令`).not.toMatch(rawTailwindDirectiveRE)
}
