import fs from 'node:fs/promises'
import process from 'node:process'
import { format as formatMessage } from 'node:util'
import { execa } from 'execa'
import path from 'pathe'

const buildTasks = new Map<string, Promise<void>>()
const hbuilderxCliCandidates = [
  process.env['HBUILDERX_CLI_PATH'],
  process.platform === 'darwin' ? '/Applications/HBuilderX.app/Contents/MacOS/cli' : undefined,
].filter((item): item is string => Boolean(item))

interface EnsureProjectBuiltOptions {
  force?: boolean
}

function logE2EError(message: string, ...args: unknown[]) {
  process.stderr.write(`${formatMessage(message, ...args)}\n`)
}

function wait(timeoutMs: number) {
  return new Promise(resolve => setTimeout(resolve, timeoutMs))
}

async function fileExists(file: string) {
  try {
    await fs.access(file)
    return true
  }
  catch {
    return false
  }
}

async function resolveHBuilderXCliPath() {
  for (const candidate of hbuilderxCliCandidates) {
    if (await fileExists(candidate)) {
      return candidate
    }
  }
  return process.env['HBUILDERX_CLI_PATH']
}

async function cleanupWechatDevToolsAfterHBuilderXBuild() {
  if (process.platform !== 'darwin') {
    return
  }
  await execa('osascript', ['-e', 'quit app "wechatwebdevtools"'], {
    reject: false,
    timeout: 5000,
  }).catch(() => undefined)
  await execa('pkill', ['-f', '/Applications/wechatwebdevtools.app'], {
    reject: false,
  }).catch(() => undefined)
  await execa('pkill', ['-f', 'wechatwebdevtools Daemon'], {
    reject: false,
  }).catch(() => undefined)
  await wait(500)
}

async function runHBuilderXCli(root: string, args: string[], env: Record<string, string | undefined>, timeoutMs: number) {
  const stdio = process.env['E2E_DEBUG_BUILD'] === '1' ? 'inherit' : 'pipe'
  try {
    await execa('pnpm', ['exec', 'hbuilderx', ...args], {
      cwd: root,
      env,
      stdio,
      timeout: timeoutMs,
    })
  }
  catch (error) {
    if (stdio !== 'inherit') {
      logE2EError('[e2e] HBuilderX command failed in %s: pnpm exec hbuilderx %s\n%o', root, args.join(' '), error)
    }
    throw error
  }
}

function isHBuilderXMiniProgramProject(root: string, pkg?: { name?: string }) {
  const name = pkg?.name ?? ''
  const normalizedRoot = root.replaceAll('\\', '/')
  return name.includes('hbuilderx-tailwindcss')
    || normalizedRoot.includes('/uni-app-vite-vue3-hbuilderx-tailwindcss-')
    || normalizedRoot.includes('/uni-app-x-hbuilderx-tailwindcss-')
}

function isIdeUniAppViteMiniProgramProject(root: string, pkg?: { name?: string }) {
  if (process.env['E2E_IDE'] !== '1') {
    return false
  }
  const name = pkg?.name ?? ''
  const normalizedRoot = root.replaceAll('\\', '/')
  return name.includes('uni-app-vite-tailwindcss-v3')
    || name.includes('uni-app-vite-tailwindcss-v4')
    || normalizedRoot.includes('/uni-app-vite-tailwindcss-v3')
    || normalizedRoot.includes('/uni-app-vite-tailwindcss-v4')
}

async function ensureHBuilderXMiniProgramBuilt(root: string, pkgPath: string, pkg?: { name?: string }) {
  const timeoutMs = Number(process.env['E2E_IDE_HBUILDERX_DEV_BUILD_TIMEOUT_MS'] ?? process.env['E2E_IDE_BUILD_TIMEOUT_MS'] ?? 120_000)
  const hbuilderxCliPath = await resolveHBuilderXCliPath()
  const childEnv: Record<string, string | undefined> = {
    ...process.env,
    HBUILDERX_CLI_PATH: hbuilderxCliPath,
    NODE_ENV: 'development',
    BROWSERSLIST_ENV: 'development',
    RUST_BACKTRACE: process.env['RUST_BACKTRACE'] ?? '1',
    WEAPP_TW_HMR_TIMING: process.env['WEAPP_TW_HMR_TIMING'] ?? '1',
    npm_package_json: pkgPath,
    PNPM_PACKAGE_NAME: pkg?.name ?? process.env['PNPM_PACKAGE_NAME'],
    INIT_CWD: root,
  }

  delete childEnv['VITEST']
  for (const key of Object.keys(childEnv)) {
    if (key.startsWith('VITEST_')) {
      delete childEnv[key]
    }
  }

  await fs.rm(path.resolve(root, 'unpackage/dist/dev/mp-weixin'), {
    recursive: true,
    force: true,
  })
  await fs.rm(path.resolve(root, 'dist/dev/mp-weixin'), {
    recursive: true,
    force: true,
  })

  try {
    await runHBuilderXCli(root, ['project', 'open', '--path', root], childEnv, timeoutMs)
    await runHBuilderXCli(root, ['launch', 'mp-weixin', '--project', root, '--compile', 'true'], childEnv, timeoutMs)

    const outputRoots = [
      path.resolve(root, 'unpackage/dist/dev/mp-weixin'),
      path.resolve(root, 'dist/dev/mp-weixin'),
    ]
    const requiredFiles = [
      'app.json',
      'project.config.json',
      'pages/index/index.js',
      'pages/index/index.json',
      'pages/index/index.wxml',
    ]
    const startedAt = Date.now()
    while (Date.now() - startedAt < timeoutMs) {
      for (const outputRoot of outputRoots) {
        const ready = await Promise.all(requiredFiles.map(file => fileExists(path.resolve(outputRoot, file))))
        if (ready.every(Boolean)) {
          return
        }
      }
      await wait(500)
    }
    throw new Error(`[e2e] HBuilderX mp-weixin compile output did not become ready in ${timeoutMs}ms: ${outputRoots.join(', ')}`)
  }
  finally {
    await cleanupWechatDevToolsAfterHBuilderXBuild()
  }
}

async function ensureUniAppViteDevMiniProgramBuilt(root: string, pkgPath: string, pkg?: { name?: string }) {
  const timeoutMs = Number(process.env['E2E_IDE_UNI_APP_DEV_BUILD_TIMEOUT_MS'] ?? process.env['E2E_IDE_BUILD_TIMEOUT_MS'] ?? 120_000)
  const outputRoot = path.resolve(root, 'dist/dev/mp-weixin')
  const requiredFiles = [
    'app.json',
    'project.config.json',
    'pages/index/index.js',
    'pages/index/index.json',
    'pages/index/index.wxml',
  ]
  const childEnv: Record<string, string | undefined> = {
    ...process.env,
    NODE_ENV: 'development',
    BROWSERSLIST_ENV: 'development',
    RUST_BACKTRACE: process.env['RUST_BACKTRACE'] ?? '1',
    WEAPP_TW_HMR_TIMING: process.env['WEAPP_TW_HMR_TIMING'] ?? '1',
    npm_package_json: pkgPath,
    PNPM_PACKAGE_NAME: pkg?.name ?? process.env['PNPM_PACKAGE_NAME'],
    INIT_CWD: root,
  }

  delete childEnv['VITEST']
  for (const key of Object.keys(childEnv)) {
    if (key.startsWith('VITEST_')) {
      delete childEnv[key]
    }
  }

  await fs.rm(outputRoot, {
    recursive: true,
    force: true,
  })

  const stdio = process.env['E2E_DEBUG_BUILD'] === '1' ? 'inherit' : 'pipe'
  const child = execa('pnpm', ['run', 'dev:mp-weixin'], {
    cwd: root,
    env: childEnv,
    stdio,
    forceKillAfterDelay: 1000,
  })
  let childError: unknown
  const childDone = child.catch((error) => {
    childError = error
  })

  try {
    const startedAt = Date.now()
    while (Date.now() - startedAt < timeoutMs) {
      if (childError) {
        if (stdio !== 'inherit') {
          logE2EError('[e2e] uni-app dev build failed in %s: %o', root, childError)
        }
        throw childError
      }
      const ready = await Promise.all(requiredFiles.map(file => fileExists(path.resolve(outputRoot, file))))
      if (ready.every(Boolean)) {
        return
      }
      await wait(500)
    }
    throw new Error(`[e2e] uni-app dev mp-weixin output did not become ready in ${timeoutMs}ms: ${outputRoot}`)
  }
  finally {
    child.kill('SIGTERM')
    await Promise.race([
      childDone,
      wait(3000),
    ]).catch(() => undefined)
  }
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

    if (isHBuilderXMiniProgramProject(root, pkg)) {
      await ensureHBuilderXMiniProgramBuilt(root, pkgPath, pkg)
      return
    }

    if (isIdeUniAppViteMiniProgramProject(root, pkg)) {
      await ensureUniAppViteDevMiniProgramBuilt(root, pkgPath, pkg)
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
