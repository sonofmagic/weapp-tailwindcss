import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import { minVersion } from 'semver'
import { parse as parseYaml } from 'yaml'
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

type PnpmLockDependencyEntry = string | { specifier?: string, version?: string }

interface PnpmLockImporter {
  dependencies?: Record<string, PnpmLockDependencyEntry>
  devDependencies?: Record<string, PnpmLockDependencyEntry>
  optionalDependencies?: Record<string, PnpmLockDependencyEntry>
}

interface PnpmLockfile {
  importers?: Record<string, PnpmLockImporter | undefined>
  packages?: Record<string, { version?: string } | null | undefined>
}

const TEMPLATES_DIR = path.join(ROOT, 'templates')
const tailwindVersionCache = new Map<string, string>()
const latestVersionCache = new Map<string, string>()
const INSTALL_CONCURRENCY = 2
const NETWORK_CONCURRENCY_ARGS = ['--network-concurrency', String(INSTALL_CONCURRENCY)]
const CPU_COUNT = os.cpus()?.length ?? 2
const DEFAULT_TEMPLATE_CONCURRENCY = Math.min(Math.max(CPU_COUNT - 1, 1), 4)
const TEMPLATE_PROCESS_CONCURRENCY = (() => {
  const raw = process.env.SYNC_TEMPLATE_CONCURRENCY
  if (!raw) {
    return DEFAULT_TEMPLATE_CONCURRENCY
  }
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TEMPLATE_CONCURRENCY
})()
function buildCommandEnv(overrides: CommandEnv = {}): NodeJS.ProcessEnv {
  const baseEnv: NodeJS.ProcessEnv = { ...process.env }
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
  const cached = latestVersionCache.get(pkgName)
  if (cached) {
    return cached
  }
  const { stdout } = await execa('pnpm', ['view', pkgName, 'version', '--json'], {
    cwd: ROOT,
    timeout: 60_000,
    killSignal: 'SIGTERM',
    env: buildCommandEnv(),
  })
  const data = JSON.parse(stdout) as string | string[]
  const latest = Array.isArray(data) ? data.at(-1) : data
  if (!latest) {
    throw new Error(`未获取到 ${pkgName} 的版本信息`)
  }
  latestVersionCache.set(pkgName, latest)
  return latest
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
  const [
    weappIdeCliVersion,
    weappViteVersion,
    sassVersion,
    sassEmbeddedVersion,
    typescriptVersion,
  ] = await Promise.all([
    fetchLatestVersion('weapp-ide-cli'),
    fetchLatestVersion('weapp-vite'),
    fetchLatestVersion('sass'),
    fetchLatestVersion('sass-embedded'),
    fetchLatestVersion('typescript'),
  ])
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

function updateDependencyRange(
  pkg: PackageJson,
  targets: TargetPackage[],
): { changed: boolean, touched: TargetPackage[] } {
  let updated = false
  const touched = new Map<string, TargetPackage>()
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
        touched.set(target.name, target)
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
        touched.set(target.name, target)
      }
    }
  }
  return {
    changed: updated,
    touched: [...touched.values()],
  }
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
    return pnpmLockNeedsUpdate(templateDir, targets)
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

function matchesPnpmResolvedVersion(resolved: string | undefined, version: string): boolean {
  if (!resolved) {
    return false
  }
  if (resolved === version) {
    return true
  }
  return resolved.startsWith(`${version}(`)
}

function extractPnpmEntryVersion(entry: PnpmLockDependencyEntry | undefined): string | null {
  if (!entry) {
    return null
  }
  if (typeof entry === 'string') {
    return entry
  }
  if (entry && typeof entry === 'object' && typeof entry.version === 'string') {
    return entry.version
  }
  return null
}

function pnpmLockHasTarget(lock: PnpmLockfile | null, target: TargetPackage): boolean {
  if (!lock || typeof lock !== 'object') {
    return false
  }
  const importers = lock.importers
  if (importers && typeof importers === 'object') {
    for (const importer of Object.values(importers)) {
      if (!importer || typeof importer !== 'object') {
        continue
      }
      for (const field of ['dependencies', 'devDependencies', 'optionalDependencies'] as const) {
        const section = importer[field]
        if (!section || typeof section !== 'object') {
          continue
        }
        const version = extractPnpmEntryVersion(section[target.name])
        if (matchesPnpmResolvedVersion(version ?? undefined, target.version)) {
          return true
        }
      }
    }
  }

  const packages = lock.packages
  if (packages && typeof packages === 'object') {
    for (const [key, meta] of Object.entries(packages)) {
      if (!key.startsWith(`${target.name}@`)) {
        continue
      }
      const keyVersion = key.slice(target.name.length + 1)
      if (matchesPnpmResolvedVersion(keyVersion, target.version)) {
        return true
      }
      if (meta && typeof meta === 'object' && typeof meta.version === 'string') {
        if (matchesPnpmResolvedVersion(meta.version, target.version)) {
          return true
        }
      }
    }
  }

  return false
}

function pnpmLockNeedsUpdate(templateDir: string, targets: TargetPackage[]): boolean {
  const lockPath = path.join(templateDir, 'pnpm-lock.yaml')
  if (!existsSync(lockPath)) {
    return false
  }
  const content = readFileSync(lockPath, 'utf8')
  try {
    const parsed = parseYaml(content) as PnpmLockfile
    return targets.some(target => !pnpmLockHasTarget(parsed, target))
  }
  catch (error) {
    console.warn(`无法解析 ${lockPath}，将尝试重新生成锁文件。`, error)
    return true
  }
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
        ['install', '--lockfile-only', '--ignore-workspace', '--ignore-scripts', ...NETWORK_CONCURRENCY_ARGS],
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
        + ' 已更新 package.json，后续可在联网环境中于该模板目录执行 "pnpm install --lockfile-only --ignore-scripts --ignore-workspace" 来刷新锁文件。',
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
  const relevantTargets = dedupeTargets([
    ...filterTargetsForPackage(pkg, baseTargets),
    ...tailwindTargets,
  ])
  const lockTargets = relevantTargets.filter(target => hasPackageReference(pkg, target.name))
  const manager = detectManager(templateDir, pkg)
  const { changed: depsChanged, touched: changedTargets } = updateDependencyRange(pkg, relevantTargets)
  const pnpmChanged = ensurePnpmOnlyBuiltDependencies(pkg, relevantTargets, manager)
  const needLock = lockTargets.length > 0 && lockNeedsUpdate(templateDir, manager, lockTargets)
  const shouldUpdateLock = depsChanged || needLock

  if (!depsChanged && !pnpmChanged && !needLock) {
    return false
  }

  if (depsChanged || pnpmChanged) {
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, indent)}\n`)
  }

  if (shouldUpdateLock) {
    console.log(`更新 ${templateName} 使用 ${manager.name} 生成锁文件...`)
    await updateLockfile(templateDir, manager)
    const summaryTargets = depsChanged ? changedTargets : lockTargets
    summaryTargets.forEach(target => summary.add(`${target.name}@${target.range}`))
  }

  // await formatTemplateCode(templateDir)

  return true
}

async function main(): Promise<void> {
  if (!existsSync(TEMPLATES_DIR)) {
    console.error(`未找到 ${TEMPLATES_DIR} 目录。`)
    process.exit(1)
  }

  const baseTargets = await resolveBaseTargets()
  const entries = readdirSync(TEMPLATES_DIR, { withFileTypes: true })
  const updated: string[] = []
  const summary = new Set<string>()
  const templateNames = entries.filter(entry => entry.isDirectory()).map(entry => entry.name)
  let cursor = 0
  const workerCount = Math.min(TEMPLATE_PROCESS_CONCURRENCY, templateNames.length)
  const workers = Array.from({ length: workerCount || 1 }, () =>
    (async () => {
      while (true) {
        const index = cursor++
        if (index >= templateNames.length) {
          break
        }
        const name = templateNames[index]!
        try {
          if (await processTemplate(name, baseTargets, summary)) {
            updated.push(name)
          }
        }
        catch (error) {
          if (error instanceof Error) {
            error.message = `处理 ${name} 失败：${error.message}`
            throw error
          }
          throw new Error(`处理 ${name} 失败：${String(error)}`)
        }
      }
    })())

  await Promise.all(workers)

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
