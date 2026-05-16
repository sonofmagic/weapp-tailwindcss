import fs from 'node:fs/promises'
import process from 'node:process'
import { format as formatMessage } from 'node:util'
import { execa } from 'execa'
import path from 'pathe'

const buildTasks = new Map<string, Promise<void>>()

interface EnsureProjectBuiltOptions {
  force?: boolean
}

function logE2EError(message: string, ...args: unknown[]) {
  process.stderr.write(`${formatMessage(message, ...args)}\n`)
}

export async function ensureProjectBuilt(root: string, options: EnsureProjectBuiltOptions = {}) {
  const existing = buildTasks.get(root)
  if (existing && !options.force) {
    return existing
  }

  const task = (async () => {
    let pkg: { name?: string, scripts?: Record<string, string> } | undefined
    const pkgPath = path.resolve(root, 'package.json')
    try {
      const content = await fs.readFile(pkgPath, 'utf8')
      pkg = JSON.parse(content)
    }
    catch {
      return
    }

    const buildScript = pkg?.scripts?.['build']
    if (!buildScript) {
      return
    }

    const stdio = process.env['E2E_DEBUG_BUILD'] === '1' ? 'inherit' : 'pipe'
    const childEnv: Record<string, string | undefined> = {
      ...process.env,
      // Vitest workers set NODE_ENV=test; Taro + Vite builds are not stable in that mode.
      NODE_ENV: 'production',
      BROWSERSLIST_ENV: 'production',
      TARO_BUILD_STRICT: '1',
      UNI_BUILD_STRICT: '1',
      RUST_BACKTRACE: process.env['RUST_BACKTRACE'] ?? '1',
      npm_package_json: pkgPath,
      PNPM_PACKAGE_NAME: pkg?.name ?? process.env['PNPM_PACKAGE_NAME'],
      INIT_CWD: root,
    }

    delete childEnv['WEAPP_TW_SKIP_INTERACTIVE_TARO_BUILD']
    delete childEnv['WEAPP_TW_SKIP_INTERACTIVE_UNI_BUILD']

    delete childEnv['VITEST']
    for (const key of Object.keys(childEnv)) {
      if (key.startsWith('VITEST_')) {
        delete childEnv[key]
      }
    }

    try {
      await execa('pnpm', ['run', 'build'], {
        cwd: root,
        env: childEnv,
        stdio,
      })
    }
    catch (error) {
      if (stdio !== 'inherit') {
        logE2EError('[e2e] build failed in %s: %o', root, error)
      }
      throw error
    }
  })()

  buildTasks.set(root, task)
  try {
    await task
  }
  catch (error) {
    buildTasks.delete(root)
    throw error
  }
}
