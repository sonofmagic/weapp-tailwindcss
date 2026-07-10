import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, it } from 'vitest'
import { createWatchSession } from '../../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/session'
import { readFileIfExists, waitFor, writeFilePreserveEol } from '../../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/text'
import { resolveCaseName, runHotUpdateTarget, shouldRunTarget } from '../shared'

const ROOT_STYLE_HMR_TIMEOUT_MS = 240000
const ROOT_STYLE_HMR_PROBE = 'text-[198.31rpx]'

async function runRootStyleImportShellHmr(options: {
  devScript: string
  extension: 'acss' | 'wxss'
  platform: 'mp-alipay' | 'mp-weixin'
}) {
  const projectRoot = path.resolve(import.meta.dirname, '../../../../demo/uni-app-vite-tailwindcss-v4')
  const appSourceFile = path.join(projectRoot, 'src/App.vue')
  const outputRoot = path.join(projectRoot, 'dist/dev', options.platform)
  const appStyleFile = path.join(outputRoot, `app.${options.extension}`)
  const mainStyleFile = path.join(outputRoot, `main.${options.extension}`)
  const importShell = `@import "./main.${options.extension}";`
  const originalSource = await fs.readFile(appSourceFile, 'utf8')
  const updatedSource = originalSource.replace(
    '</script>',
    `const rootStyleHmrProbe = '${ROOT_STYLE_HMR_PROBE}'\n</script>`,
  )
  if (updatedSource === originalSource) {
    throw new Error(`[${options.platform}] App.vue script fixture is missing`)
  }

  const assertOutputs = async (hasProbe: boolean) => {
    const [appStyle, mainStyle] = await Promise.all([
      readFileIfExists(appStyleFile),
      readFileIfExists(mainStyleFile),
    ])
    if (appStyle?.trim() !== importShell || !mainStyle?.includes('--tw-')) {
      return false
    }
    return mainStyle.includes('198.31rpx') === hasProbe
  }

  const sessionStartedAt = Date.now()
  const session = createWatchSession(projectRoot, options.devScript, { quietSass: true })
  try {
    await waitFor(
      async () => session.lastCompileSuccessAt() > sessionStartedAt && await assertOutputs(false),
      {
        timeoutMs: ROOT_STYLE_HMR_TIMEOUT_MS,
        pollMs: 50,
        message: `[${options.platform}] initial root style import shell was not generated`,
        onTick: session.ensureRunning,
      },
      sessionStartedAt,
    )

    const updateStartedAt = Date.now()
    await writeFilePreserveEol(appSourceFile, updatedSource, originalSource)
    await waitFor(
      async () => session.lastCompileSuccessAt() > updateStartedAt && await assertOutputs(true),
      {
        timeoutMs: ROOT_STYLE_HMR_TIMEOUT_MS,
        pollMs: 50,
        message: `[${options.platform}] root style import shell was not preserved after App.vue update`,
        onTick: session.ensureRunning,
      },
      updateStartedAt,
    )

    const rollbackStartedAt = Date.now()
    await writeFilePreserveEol(appSourceFile, originalSource, updatedSource)
    await waitFor(
      async () => session.lastCompileSuccessAt() > rollbackStartedAt && await assertOutputs(false),
      {
        timeoutMs: ROOT_STYLE_HMR_TIMEOUT_MS,
        pollMs: 50,
        message: `[${options.platform}] root style import shell was not preserved after App.vue rollback`,
        onTick: session.ensureRunning,
      },
      rollbackStartedAt,
    )
  }
  finally {
    await writeFilePreserveEol(appSourceFile, originalSource, originalSource).catch(() => undefined)
    await session.stop()
  }
}

describe('e2e watch hot-update uni-app-vite-tailwindcss-v4', () => {
  const caseName = resolveCaseName()
  const target = 'uni-app-vite-tailwindcss-v4' as const

  if (!shouldRunTarget(caseName, target)) {
    it.skip('skips uni-app-vite-tailwindcss-v4 watch hot-update for current E2E_WATCH_CASE filter', () => {})
    return
  }

  it('should verify template/script/style hot updates and project report for uni-app-vite-tailwindcss-v4', async () => {
    await runHotUpdateTarget(target)
  })

  it.each([
    { devScript: 'dev:mp-weixin', extension: 'wxss', platform: 'mp-weixin' },
    { devScript: 'dev:mp-alipay', extension: 'acss', platform: 'mp-alipay' },
  ] as const)('should preserve the uni-app root $extension import shell during App.vue HMR', async (options) => {
    await runRootStyleImportShellHmr(options)
  }, ROOT_STYLE_HMR_TIMEOUT_MS)
})
