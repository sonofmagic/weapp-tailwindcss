import fs from 'node:fs/promises'
import automator from 'miniprogram-automator'
import path from 'pathe'
import { describe, it } from 'vitest'
import { ensureProjectBuilt } from './projectTest'
import { logE2EError, wait } from './shared'

interface AppConfig {
  pages?: string[]
}

async function withTimeout<T>(task: Promise<T>, timeoutMs: number, label: string) {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      task,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`${label}_TIMEOUT_${timeoutMs}`))
        }, timeoutMs)
      }),
    ])
  }
  finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
}

function canSkipLaunchError(error: any) {
  const message = String(error?.message ?? '')
  return error?.code === 'EPERM'
    || /EPERM/i.test(message)
    || /ECONNREFUSED/i.test(message)
    || /timeout/i.test(message)
    || /LAUNCH_TIMEOUT/i.test(message)
}

describe.skip('e2e native skyline pages', () => {
  it('visits all declared pages', async () => {
    const root = path.resolve(__dirname, '../apps/vite-native-ts-skyline')
    await ensureProjectBuilt(root)

    const appJsonPath = path.resolve(root, 'dist/app.json')
    const appConfig = JSON.parse(await fs.readFile(appJsonPath, 'utf8')) as AppConfig
    const pages = Array.isArray(appConfig.pages) ? appConfig.pages : []
    expect(pages.length).toBeGreaterThan(0)

    let miniProgram: any
    try {
      miniProgram = await withTimeout(
        automator.launch({
          projectPath: root,
        }),
        Number(process.env.E2E_AUTOMATOR_TIMEOUT_MS ?? 25_000),
        'LAUNCH',
      )
    }
    catch (error: any) {
      if (canSkipLaunchError(error)) {
        logE2EError('[e2e] skip skyline page traversal: %s', error?.message ?? error)
        await wait()
        return
      }
      throw error
    }

    const visited: string[] = []

    try {
      for (const pagePath of pages) {
        const url = pagePath.startsWith('/') ? pagePath : `/${pagePath}`
        const page = await withTimeout(
          miniProgram.reLaunch(url),
          Number(process.env.E2E_AUTOMATOR_TIMEOUT_MS ?? 25_000),
          'RELAUNCH',
        )
        expect(page).toBeTruthy()

        const pageRoot = await page?.$('page')
        const wxml = await pageRoot?.wxml()
        expect(typeof wxml).toBe('string')
        expect((wxml ?? '').trim().length).toBeGreaterThan(0)

        visited.push(url)
        await page.waitFor(400)
      }
    }
    finally {
      await miniProgram?.close()
    }

    const expected = pages.map(pagePath => pagePath.startsWith('/') ? pagePath : `/${pagePath}`)
    expect(visited).toEqual(expected)
  })
})
