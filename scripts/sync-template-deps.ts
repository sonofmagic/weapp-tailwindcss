import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { Socket } from 'node:net'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import { minVersion } from 'semver'
import { ROOT } from './template-utils'

type PnpmConfig = Record<string, unknown> & {
  onlyBuiltDependencies?: unknown
}

type PackageJson = Record<string, unknown> & {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  packageManager?: string
  pnpm?: PnpmConfig
}

type Manager = 'pnpm' | 'yarn' | 'npm'

type CommandEnv = Record<string, string | undefined>

interface ManagerInfo {
  name: Manager
  version?: string | null
}

interface TargetPackage {
  name: string
  version: string
  range: string
  addIfMissing?: 'dependencies' | 'devDependencies'
  forceInclude?: boolean
  ensurePnpmOnlyBuilt?: boolean
}

const TEMPLATES_DIR = path.join(ROOT, 'templates')
const tailwindVersionCache = new Map<string, string>()
const INSTALL_CONCURRENCY = 2
const NETWORK_CONCURRENCY_ARGS = ['--network-concurrency', String(INSTALL_CONCURRENCY)]
const SCRIPT_ARGS = new Set(process.argv.slice(2))
const DISABLE_PROXY
  = SCRIPT_ARGS.has('--no-proxy')
    || /^1|true$/iu.test(
      process.env.SYNC_TEMPLATE_DISABLE_PROXY ?? process.env.SYNC_TEMPLATE_NO_PROXY ?? '',
    )
const PROXY_ENV_VARS = [
  'HTTP_PROXY',
  'http_proxy',
  'HTTPS_PROXY',
  'https_proxy',
  'ALL_PROXY',
  'all_proxy',
  'NO_PROXY',
  'no_proxy',
  'npm_config_proxy',
  'npm_config_https_proxy',
  'npm_config_http_proxy',
]
const PROXY_ASSIGNMENT_KEYS = [
  'HTTP_PROXY',
  'http_proxy',
  'HTTPS_PROXY',
  'https_proxy',
  'ALL_PROXY',
  'all_proxy',
  'npm_config_proxy',
  'npm_config_https_proxy',
  'npm_config_http_proxy',
]
const LOCAL_PROXY_HOST = '127.0.0.1'
const LOCAL_PROXY_PORT = 7890
const LOCAL_PROXY_URL = `http://${LOCAL_PROXY_HOST}:${LOCAL_PROXY_PORT}`
let detectedProxyEnv: CommandEnv | null = null
let proxySetupDone = false

function hasCustomProxyConfiguration(env: NodeJS.ProcessEnv): boolean {
  return PROXY_ASSIGNMENT_KEYS.some((key) => {
    const value = env[key]
    return typeof value === 'string' && value.length > 0
  })
}

function createProxyEnv(url: string): CommandEnv {
  return PROXY_ASSIGNMENT_KEYS.reduce<CommandEnv>((acc, key) => {
    acc[key] = url
    return acc
  }, {})
}

function probeLocalHttpProxy(host: string, port: number, timeoutMs = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new Socket()
    const cleanup = (): void => {
      socket.removeAllListeners()
      socket.destroy()
    }
    const handleSuccess = (): void => {
      cleanup()
      resolve(true)
    }
    const handleFailure = (): void => {
      cleanup()
      resolve(false)
    }
    socket.setTimeout(timeoutMs)
    socket.once('connect', handleSuccess)
    socket.once('timeout', handleFailure)
    socket.once('error', handleFailure)
    try {
      socket.connect(port, host)
    }
    catch {
      handleFailure()
    }
  })
}

async function ensureDefaultProxyEnv(): Promise<void> {
  if (proxySetupDone) {
    return
  }
  proxySetupDone = true
  if (DISABLE_PROXY) {
    return
  }
  if (hasCustomProxyConfiguration(process.env)) {
    return
  }
  const available = await probeLocalHttpProxy(LOCAL_PROXY_HOST, LOCAL_PROXY_PORT)
  if (available) {
    detectedProxyEnv = createProxyEnv(LOCAL_PROXY_URL)
    console.log(`检测到本地代理 ${LOCAL_PROXY_URL}，将优先通过该代理执行依赖安装。`)
  }
}

function buildCommandEnv(overrides: CommandEnv = {}): NodeJS.ProcessEnv {
  const baseEnv: NodeJS.ProcessEnv = { ...process.env }
  if (DISABLE_PROXY) {
    for (const key of PROXY_ENV_VARS) {
      delete baseEnv[key]
    }
  }
  else if (detectedProxyEnv) {
    for (const [key, value] of Object.entries(detectedProxyEnv)) {
      if (baseEnv[key] === undefined) {
        baseEnv[key] = value
      }
    }
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete baseEnv[key]
    }
    else {
      baseEnv[key] = value
    }
  }
  return baseEnv
}

function readWorkspacePackageVersion(relativeDir: string): string {
  const pkgPath = path.join(ROOT, relativeDir, 'package.json')
  const pkgRaw = readFileSync(pkgPath, 'utf8')
  const pkg = JSON.parse(pkgRaw) as { version: string }
  return pkg.version
}

async function fetchLatestVersion(pkgName: string): Promise<string> {
  const { stdout } = await execa('pnpm', ['view', pkgName, 'version', '--json'], {
    cwd: ROOT,
    timeout: 60_000,
    killSignal: 'SIGTERM',
    env: buildCommandEnv(),
  })
  const data = JSON.parse(stdout) as string | string[]
  if (Array.isArray(data)) {
    const latest = data.at(-1)
    if (!latest) {
      throw new Error(`未获取到 ${pkgName} 的版本信息`)
    }
    return latest
  }
  if (data) {
    return data
  }
  throw new Error(`未获取到 ${pkgName} 的版本信息`)
}

async function fetchTailwindVersion(pkgName: string, major: number): Promise<string> {
  const cacheKey = `${pkgName}@${major}`
  const cached = tailwindVersionCache.get(cacheKey)
  if (cached) {
    return cached
  }
  const { stdout } = await execa('pnpm', ['view', `${pkgName}@^${major}`, 'version', '--json'], {
    cwd: ROOT,
    timeout: 60_000,
    killSignal: 'SIGTERM',
    env: buildCommandEnv(),
  })
  const data = JSON.parse(stdout) as string | string[]
  const version = Array.isArray(data) ? data.at(-1) : data
  if (!version) {
    throw new Error(`未获取到 ${pkgName}@^${major} 的版本信息`)
  }
  tailwindVersionCache.set(cacheKey, version)
  return version
}

async function resolveBaseTargets(): Promise<TargetPackage[]> {
  const weappTailwindcssVersion = readWorkspacePackageVersion(path.join('packages', 'weapp-tailwindcss'))
  const mergeVersion = readWorkspacePackageVersion(path.join('packages-runtime', 'merge'))
  const weappIdeCliVersion = await fetchLatestVersion('weapp-ide-cli')
  const weappViteVersion = await fetchLatestVersion('weapp-vite')
  const sassVersion = await fetchLatestVersion('sass')
  const sassEmbeddedVersion = await fetchLatestVersion('sass-embedded')
  const typescriptVersion = await fetchLatestVersion('typescript')
  return [
    {
      name: 'weapp-tailwindcss',
      version: weappTailwindcssVersion,
      range: `^${weappTailwindcssVersion}`,
      addIfMissing: 'devDependencies',
    },
    {
      name: '@weapp-tailwindcss/merge',
      version: mergeVersion,
      range: `^${mergeVersion}`,
      addIfMissing: 'dependencies',
      forceInclude: true,
      ensurePnpmOnlyBuilt: true,
    },
    {
      name: 'weapp-ide-cli',
      version: weappIdeCliVersion,
      range: `^${weappIdeCliVersion}`,
    },
    {
      name: 'weapp-vite',
      version: weappViteVersion,
      range: `^${weappViteVersion}`,
    },
    {
      name: 'sass',
      version: sassVersion,
      range: `^${sassVersion}`,
    },
    {
      name: 'sass-embedded',
      version: sassEmbeddedVersion,
      range: `^${sassEmbeddedVersion}`,
    },
    {
      name: 'typescript',
      version: typescriptVersion,
      range: `^${typescriptVersion}`,
    },
  ]
}

function detectIndentation(source: string): string | number {
  const match = source.match(/\n(\s+)\S/u)
  if (match) {
    const indent = match[1]!
    if (indent.includes('\t')) {
      return '\t'
    }
    const spaces = indent.length
    if (spaces > 0) {
      return Math.min(spaces, 2)
    }
  }
  return 2
}

function buildVersionRange(current: string | undefined, target: TargetPackage): string {
  const targetVersion = target.version
  if (!current) {
    return target.range
  }
  const trimmed = current.trim()

  if (trimmed.startsWith('workspace:')) {
    return trimmed
  }

  const prefix = trimmed.startsWith('~')
    ? '~'
    : trimmed.startsWith('^')
      ? '^'
      : trimmed.startsWith('>=')
        ? '>='
        : trimmed.startsWith('*')
          ? '*'
          : ''

  if (prefix === '>=' || prefix === '*') {
    return `${prefix}${targetVersion}`
  }

  if (prefix === '' && target.range.startsWith('workspace:')) {
    return target.range
  }

  return `${prefix || ''}${targetVersion}`
}

function hasPackageReference(pkg: PackageJson, name: string): boolean {
  const deps = pkg.dependencies ?? {}
  const devDeps = pkg.devDependencies ?? {}
  return Boolean((deps as Record<string, string>)[name] ?? (devDeps as Record<string, string>)[name])
}

function ensureSection(pkg: PackageJson, field: 'dependencies' | 'devDependencies'): Record<string, string> {
  const section = pkg[field]
  if (section && typeof section === 'object') {
    return section as Record<string, string>
  }
  const created: Record<string, string> = {}
  pkg[field] = created
  return created
}

function ensurePnpmOnlyBuiltDependencies(
  pkg: PackageJson,
  targets: TargetPackage[],
  manager: ManagerInfo,
): boolean {
  if (manager.name !== 'pnpm') {
    return false
  }

  const required = Array.from(
    new Set(
      targets
        .filter(target => target.ensurePnpmOnlyBuilt)
        .map(target => target.name),
    ),
  )

  if (required.length === 0) {
    return false
  }

  let changed = false
  let pnpmConfig = pkg.pnpm
  if (!pnpmConfig || typeof pnpmConfig !== 'object') {
    pnpmConfig = {} as PnpmConfig
    pkg.pnpm = pnpmConfig
    changed = true
  }

  const config = pnpmConfig as PnpmConfig
  const rawOnlyBuilt = config.onlyBuiltDependencies

  let onlyBuilt: string[]
  if (Array.isArray(rawOnlyBuilt)) {
    const allStrings = rawOnlyBuilt.every(item => typeof item === 'string')
    if (allStrings) {
      onlyBuilt = rawOnlyBuilt as string[]
    }
    else {
      onlyBuilt = rawOnlyBuilt.filter((item): item is string => typeof item === 'string')
      changed = true
    }
  }
  else {
    onlyBuilt = []
    if (rawOnlyBuilt !== undefined) {
      changed = true
    }
  }

  for (const name of required) {
    if (!onlyBuilt.includes(name)) {
      onlyBuilt.push(name)
      changed = true
    }
  }

  if (changed) {
    config.onlyBuiltDependencies = onlyBuilt
  }

  return changed
}

function updateDependencyRange(pkg: PackageJson, targets: TargetPackage[]): boolean {
  let updated = false
  for (const field of ['dependencies', 'devDependencies'] as const) {
    const section = pkg[field]
    if (!section || typeof section !== 'object') {
      continue
    }
    const typedSection = section as Record<string, string>
    for (const target of targets) {
      if (!(target.name in typedSection)) {
        continue
      }
      const current = typedSection[target.name]
      const next = buildVersionRange(current, target)
      if (current !== next) {
        typedSection[target.name] = next
        updated = true
      }
    }
  }

  for (const target of targets) {
    const existsInDeps = hasPackageReference(pkg, target.name)
    if (existsInDeps) {
      continue
    }
    if (target.addIfMissing) {
      const newSection = ensureSection(pkg, target.addIfMissing)
      if (newSection[target.name] !== target.range) {
        newSection[target.name] = target.range
        updated = true
      }
    }
  }
  return updated
}

function detectManager(templateDir: string, pkg: PackageJson): ManagerInfo {
  if (typeof pkg.packageManager === 'string') {
    if (pkg.packageManager.startsWith('pnpm')) {
      return { name: 'pnpm' }
    }
    if (pkg.packageManager.startsWith('yarn')) {
      const [, version] = pkg.packageManager.split('@')
      const cleanVersion = version?.split('+')[0] ?? null
      return { name: 'yarn', version: cleanVersion }
    }
    if (pkg.packageManager.startsWith('npm')) {
      return { name: 'npm' }
    }
  }
  if (existsSync(path.join(templateDir, 'pnpm-lock.yaml'))) {
    return { name: 'pnpm' }
  }
  if (existsSync(path.join(templateDir, 'yarn.lock'))) {
    return { name: 'yarn' }
  }
  if (existsSync(path.join(templateDir, 'package-lock.json'))) {
    return { name: 'npm' }
  }
  return { name: 'pnpm' }
}

function lockNeedsUpdate(templateDir: string, manager: ManagerInfo, targets: TargetPackage[]): boolean {
  if (targets.length === 0) {
    return false
  }
  if (manager.name === 'pnpm') {
    const lockPath = path.join(templateDir, 'pnpm-lock.yaml')
    if (!existsSync(lockPath)) {
      return false
    }
    const content = readFileSync(lockPath, 'utf8')
    return targets.some(
      target =>
        !content.includes(`${target.name}@${target.version}`)
        && !content.includes(`version: ${target.version}`),
    )
  }
  if (manager.name === 'yarn') {
    const lockPath = path.join(templateDir, 'yarn.lock')
    if (!existsSync(lockPath)) {
      return false
    }
    const content = readFileSync(lockPath, 'utf8')
    return targets.some((target) => {
      const version = target.version
      return (
        !content.includes(`${target.name}@^${version}`)
        && !content.includes(`${target.name}@${version}`)
        && !content.includes(`version "${version}`)
      )
    })
  }
  const lockPath = path.join(templateDir, 'package-lock.json')
  if (!existsSync(lockPath)) {
    return false
  }
  try {
    const lock = JSON.parse(readFileSync(lockPath, 'utf8')) as Record<string, any>
    return targets.some((target) => {
      const pkgNode = lock.packages?.[`node_modules/${target.name}`]?.version
      if (pkgNode === target.version) {
        return false
      }
      const depNode = lock.dependencies?.[target.name]?.version
      return depNode !== target.version
    })
  }
  catch (error) {
    console.warn(`无法解析 ${lockPath}，将尝试重新生成锁文件。`, error)
    return true
  }
}

function filterTargetsForPackage(pkg: PackageJson, targets: TargetPackage[]): TargetPackage[] {
  return targets.filter(target => target.forceInclude || hasPackageReference(pkg, target.name))
}

function dedupeTargets(targets: TargetPackage[]): TargetPackage[] {
  const map = new Map<string, TargetPackage>()
  targets.forEach((target) => {
    map.set(target.name, target)
  })
  return [...map.values()]
}

function getPackageRange(pkg: PackageJson, name: string): string | undefined {
  const deps = pkg.dependencies ?? {}
  if (name in deps) {
    return deps[name]
  }
  const devDeps = pkg.devDependencies ?? {}
  if (name in devDeps) {
    return devDeps[name]
  }
  return undefined
}

function isExternalSpecifier(range: string): boolean {
  return range.startsWith('npm:') || range.startsWith('catalog:')
}

async function resolveTailwindTargets(pkg: PackageJson): Promise<TargetPackage[]> {
  const range = getPackageRange(pkg, 'tailwindcss')
  if (!range || isExternalSpecifier(range)) {
    return []
  }
  const min = minVersion(range)
  if (!min) {
    return []
  }
  const major = min.major

  if (major === 3) {
    const version = await fetchTailwindVersion('tailwindcss', 3)
    return [
      {
        name: 'tailwindcss',
        version,
        range: `^${version}`,
      },
    ]
  }

  if (major === 4) {
    const version = await fetchTailwindVersion('tailwindcss', 4)
    const targets: TargetPackage[] = [
      {
        name: 'tailwindcss',
        version,
        range: `^${version}`,
      },
    ]

    if (hasPackageReference(pkg, '@tailwindcss/postcss')) {
      const postcssVersion = await fetchTailwindVersion('@tailwindcss/postcss', 4)
      targets.push({
        name: '@tailwindcss/postcss',
        version: postcssVersion,
        range: `^${postcssVersion}`,
      })
    }

    if (hasPackageReference(pkg, '@tailwindcss/vite')) {
      const viteVersion = await fetchTailwindVersion('@tailwindcss/vite', 4)
      targets.push({
        name: '@tailwindcss/vite',
        version: viteVersion,
        range: `^${viteVersion}`,
      })
    }

    return targets
  }

  return []
}

async function runCommand(
  command: string,
  args: string[],
  cwd: string,
  {
    allowFailure = false,
    env,
    timeoutMs,
  }: { allowFailure?: boolean, env?: CommandEnv, timeoutMs?: number } = {},
): Promise<boolean> {
  try {
    await execa(command, args, {
      cwd,
      stdio: 'inherit',
      env: buildCommandEnv({
        CI: '1',
        ...(env ?? {}),
      }),
      // Avoid hanging forever when network is flaky or blocked.
      timeout: timeoutMs,
      killSignal: 'SIGTERM',
    })
    return true
  }
  catch (error) {
    if (allowFailure) {
      return false
    }
    if (error instanceof Error) {
      throw new Error(`${command} ${args.join(' ')} 执行失败：${error.message}`)
    }
    throw error
  }
}

export async function formatTemplateCode(templateDir: string): Promise<void> {
  const relative = path.relative(ROOT, templateDir) || '.'
  const success = await runCommand('pnpm', ['exec', 'eslint', relative, '--fix'], ROOT, {
    allowFailure: true,
  })
  if (!success) {
    console.warn(`格式化 ${relative} 失败，可手动运行 pnpm exec eslint ${relative} --fix`)
  }
}

// Older versions renamed pnpm-workspace.yaml so template installs wouldn't bleed into the workspace.
// That rename makes git hooks/listeners hang, so keep the isolation purely via per-command envs.
async function withWorkspaceIsolation<T>(operation: () => Promise<T> | T): Promise<T> {
  return await Promise.resolve(operation())
}

async function updateLockfile(templateDir: string, manager: ManagerInfo): Promise<void> {
  const env = {
    PNPM_WORKSPACE_DIR: templateDir,
    NPM_CONFIG_WORKSPACE_DIR: templateDir,
    PNPM_PREFER_WORKSPACE_PACKAGES: 'false',
    PNPM_LINK_WORKSPACE_PACKAGES: 'false',
    NPM_CONFIG_PREFER_WORKSPACE_PACKAGES: 'false',
    NPM_CONFIG_LINK_WORKSPACE_PACKAGES: 'false',
    NPM_CONFIG_FETCH_CONCURRENCY: String(INSTALL_CONCURRENCY),
  }

  if (manager.name === 'pnpm') {
    const success = await withWorkspaceIsolation(() =>
      runCommand(
        'pnpm',
        ['install', '--lockfile-only', '--ignore-scripts', ...NETWORK_CONCURRENCY_ARGS],
        templateDir,
        {
          allowFailure: true,
          env,
          timeoutMs: 5 * 60_000,
        },
      ),
    )
    if (!success) {
      console.warn(
        `跳过为 ${templateDir} 生成 pnpm-lock.yaml：pnpm 在当前环境下无法完成解析（可能是网络被代理/防火墙阻断）。`
        + ' 已更新 package.json，后续可在联网环境中于该模板目录执行 "pnpm install --lockfile-only --ignore-scripts" 来刷新锁文件。',
      )
    }
    return
  }

  if (manager.name === 'npm') {
    const success = await withWorkspaceIsolation(() =>
      runCommand('npm', ['install', '--package-lock-only', '--ignore-scripts'], templateDir, {
        allowFailure: true,
        env,
        timeoutMs: 5 * 60_000,
      }),
    )
    if (!success) {
      console.warn(
        `跳过为 ${templateDir} 生成 package-lock.json：npm 在当前环境下无法完成解析（可能是网络被代理/防火墙阻断）。`
        + ' 已更新 package.json，后续可在联网环境中于该模板目录执行 "npm install --package-lock-only --ignore-scripts" 来刷新锁文件。',
      )
    }
    return
  }

  const yarnVersion = manager.version ?? '1.22.22'
  // Prefer to keep yarn fully isolated from the repo to prevent hooks/workspace bleed.
  // Place yarn caches outside the git repo to avoid choking git on huge untracked files.
  const baseName = path.basename(templateDir)
  const tmpRoot = path.join(os.tmpdir(), 'weapp-tailwindcss-templates')
  const yarnCacheDir = path.join(tmpRoot, baseName, '.yarn-cache')
  const yarnGlobalDir = path.join(tmpRoot, baseName, '.yarn-global')

  const yarnEnv: CommandEnv = {
    ...env,
    // Keep cache in temp dir to avoid polluting repo and triggering git watchers.
    YARN_CACHE_FOLDER: yarnCacheDir,
    YARN_GLOBAL_FOLDER: yarnGlobalDir,
    // Reduce chances of "forever waiting" on slow/blocked registries.
    YARN_NETWORK_TIMEOUT: '30000', // 30s per request
    // Force https registry for yarn classic to avoid corporate proxies blocking http.
    npm_config_registry: 'https://registry.npmjs.org/',
    // Prefer IPv4 first to mitigate IPv6 DNS stalls on some networks.
    NODE_OPTIONS: [process.env.NODE_OPTIONS, '--dns-result-order=ipv4first'].filter(Boolean).join(' '),
  }
  const yarnMajor = Number.parseInt((yarnVersion.split('.')[0] ?? '1') as string, 10)
  const supportsLockfileOnly = Number.isFinite(yarnMajor) && yarnMajor >= 2
  // Yarn classic flags
  const baseArgs = [
    'dlx',
    `yarn@${yarnVersion}`,
    'install',
    '--ignore-scripts',
    '--non-interactive',
    '--prefer-offline',
    '--no-progress',
    ...NETWORK_CONCURRENCY_ARGS,
  ]
  let updated = false
  if (supportsLockfileOnly) {
    updated = await withWorkspaceIsolation(() =>
      runCommand('pnpm', [...baseArgs, '--mode=update-lockfile'], templateDir, {
        allowFailure: true,
        env: yarnEnv,
        timeoutMs: 3 * 60_000, // 3 minutes soft cap for lock-only update
      }),
    )
  }

  if (!supportsLockfileOnly || !updated) {
    // Fallback to a normal install-like resolution, still isolated and bounded by timeout.
    const fallback = await withWorkspaceIsolation(() =>
      runCommand('pnpm', baseArgs, templateDir, {
        allowFailure: true,
        env: yarnEnv,
        timeoutMs: 5 * 60_000, // 5 minutes cap
      }),
    )
    // If we still fail (commonly due to blocked network), skip updating lock to avoid hanging the whole task.
    if (!fallback) {
      console.warn(
        `跳过为 ${templateDir} 生成 yarn.lock：yarn 在当前环境下无法完成解析（可能是网络被代理/防火墙阻断）。`
        + ` 已更新 package.json，后续可在联网环境中于该模板目录执行 "yarn install" 来刷新锁文件。`,
      )
    }
  }
}

async function processTemplate(
  templateName: string,
  baseTargets: TargetPackage[],
  summary: Set<string>,
): Promise<boolean> {
  const templateDir = path.join(TEMPLATES_DIR, templateName)
  const pkgPath = path.join(templateDir, 'package.json')
  if (!existsSync(pkgPath)) {
    return false
  }

  const raw = readFileSync(pkgPath, 'utf8')
  const indent = detectIndentation(raw)
  const pkg = JSON.parse(raw) as PackageJson
  const tailwindTargets = await resolveTailwindTargets(pkg)
  const relevantTargets = dedupeTargets([...filterTargetsForPackage(pkg, baseTargets), ...tailwindTargets])
  const manager = detectManager(templateDir, pkg)
  const depsChanged = updateDependencyRange(pkg, relevantTargets)
  const pnpmChanged = ensurePnpmOnlyBuiltDependencies(pkg, relevantTargets, manager)
  const needLock = lockNeedsUpdate(templateDir, manager, relevantTargets)

  if (!depsChanged && !pnpmChanged && !needLock) {
    return false
  }

  if (depsChanged || pnpmChanged) {
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, indent)}\n`)
  }

  if (relevantTargets.length > 0) {
    console.log(`更新 ${templateName} 使用 ${manager.name} 生成锁文件...`)
    await updateLockfile(templateDir, manager)
    relevantTargets.forEach(target => summary.add(`${target.name}@${target.range}`))
  }

  // await formatTemplateCode(templateDir)

  return true
}

async function main(): Promise<void> {
  await ensureDefaultProxyEnv()
  if (!existsSync(TEMPLATES_DIR)) {
    console.error(`未找到 ${TEMPLATES_DIR} 目录。`)
    process.exit(1)
  }

  const baseTargets = await resolveBaseTargets()
  const entries = readdirSync(TEMPLATES_DIR, { withFileTypes: true })
  const updated: string[] = []
  const summary = new Set<string>()

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }
    const name = entry.name
    try {
      if (await processTemplate(name, baseTargets, summary)) {
        updated.push(name)
      }
    }
    catch (error) {
      console.error(`处理 ${name} 失败：`, error instanceof Error ? error.message : error)
      process.exit(1)
    }
  }

  if (updated.length === 0) {
    console.log('所有模板已是最新版本，无需更新。')
  }
  else {
    const summaryText = summary.size > 0 ? Array.from(summary).join(', ') : '依赖'
    console.log(`\n已更新以下模板的 ${summaryText}:`)
    updated.forEach((name) => {
      console.log(` - ${name}`)
    })
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
