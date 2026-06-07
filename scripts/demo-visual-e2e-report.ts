import type { CaseResult, RuntimeContext } from './demo-visual-e2e-report/types.ts'
import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { chromium } from 'playwright'
import { resolveChromeExecutable } from '../e2e/hbuilderx-local/process.ts'
import { E2E_PROJECTS } from '../e2e/projectEntries.ts'
import { taroWebHmrCases } from '../e2e/taro-web-demo-hmr-cases.ts'
import { webViteHmrCases } from '../e2e/web-vite-demo-hmr-cases.ts'
import { runH5Case, runMiniProgramCase } from './demo-visual-e2e-report/cases.ts'
import {
  createMiniProgramHmrVisualConfig,
  createTaroHmrVisualConfig,
  createUniH5HmrVisualConfig,
  createWebViteHmrVisualConfig,
} from './demo-visual-e2e-report/hmr.ts'
import { writeReport } from './demo-visual-e2e-report/report.ts'

const repoRoot = path.resolve(import.meta.dirname, '..')
const defaultArtifactRoot = 'e2e/.artifacts/demo-visual/full'
const context: RuntimeContext = {
  artifactRoot: path.resolve(repoRoot, defaultArtifactRoot),
  repoRoot,
  timeoutMs: Number(process.env['DEMO_VISUAL_TIMEOUT_MS'] ?? 180_000),
  viewport: { width: 390, height: 844 },
}

const uniH5Cases = [
  'uni-app-vite-tailwindcss-v3',
  'uni-app-vite-tailwindcss-v4',
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
  'uni-app-x-hbuilderx-tailwindcss-v3',
  'uni-app-x-hbuilderx-tailwindcss-v4',
].map(name => ({
  name,
  projectDir: `demo/${name}`,
  command: ['run', 'dev:h5'],
  hmr: createUniH5HmrVisualConfig(repoRoot, name),
  env: {
    CHOKIDAR_INTERVAL: '50',
    CHOKIDAR_USEPOLLING: '1',
    UNI_CLI_SERVER_HOST: '127.0.0.1',
    WEAPP_TW_HMR_TIMING: '1',
  },
}))

function hasArg(name: string) {
  return process.argv.includes(name)
}

function readArgValue(name: string) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

function printHelp() {
  process.stdout.write([
    'Usage: pnpm exec tsx scripts/demo-visual-e2e-report.ts [options]',
    '',
    'Options:',
    '  --h5-only       只采集 H5 截图',
    '  --weapp-only    只采集小程序截图',
    '  --filter <re>   只运行名称匹配的 demo',
    '  --help          显示帮助',
    '',
  ].join('\n'))
}

function matchesFilter(name: string) {
  const filter = readArgValue('--filter') ?? process.env['DEMO_VISUAL_FILTER']
  if (!filter) {
    return true
  }
  return new RegExp(filter).test(name)
}

async function main() {
  if (hasArg('--help')) {
    printHelp()
    return
  }
  const results: CaseResult[] = []
  await fs.mkdir(path.join(context.artifactRoot, 'screenshots'), { recursive: true })
  await fs.mkdir(path.join(context.artifactRoot, 'diffs'), { recursive: true })
  if (!hasArg('--weapp-only')) {
    const executablePath = await resolveChromeExecutable()
    const browser = await chromium.launch({
      ...(executablePath ? { executablePath } : {}),
      headless: true,
    })
    try {
      for (const item of taroWebHmrCases) {
        const name = item.projectDir.replace(/^demo\//, '')
        if (!matchesFilter(name)) {
          continue
        }
        await runH5Case(browser, {
          name,
          projectDir: item.projectDir,
          command: ['exec', 'taro', 'build', '--type', 'h5', '--watch', '--host', '127.0.0.1'],
          env: {
            BROWSERSLIST_ENV: 'development',
            CHOKIDAR_INTERVAL: '50',
            CHOKIDAR_USEPOLLING: '1',
            NODE_ENV: 'development',
            TARO_ENV: 'h5',
            WEAPP_TW_HMR_TIMING: '1',
          },
          hmr: createTaroHmrVisualConfig(item),
        }, context, results)
      }
      for (const item of webViteHmrCases) {
        const name = item.projectDir.replace(/^demo\//, '')
        if (!matchesFilter(name)) {
          continue
        }
        await runH5Case(browser, {
          name,
          projectDir: item.projectDir,
          command: ['exec', 'vite', '--host', '127.0.0.1', '--strictPort'],
          hmr: createWebViteHmrVisualConfig(item),
        }, context, results)
      }
      for (const item of uniH5Cases) {
        if (!matchesFilter(item.name)) {
          continue
        }
        await runH5Case(browser, item, context, results)
      }
    }
    finally {
      await browser.close()
    }
  }
  if (!hasArg('--h5-only')) {
    for (const item of E2E_PROJECTS) {
      if (!matchesFilter(item.name)) {
        continue
      }
      await runMiniProgramCase({
        ...item,
        hmr: createMiniProgramHmrVisualConfig(repoRoot, item.name),
      }, context, results)
    }
  }
  await writeReport(results, context)
  process.stdout.write(`${JSON.stringify({ artifactRoot: context.artifactRoot, results }, null, 2)}\n`)
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
  process.exitCode = 1
})
