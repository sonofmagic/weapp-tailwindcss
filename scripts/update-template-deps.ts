import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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

interface TailwindResolution {
  targets: TargetPackage[]
  removePackages: string[]
}

const TEMPLATES_DIR = path.join(ROOT, 'templates')
const TEMP_LOCK_ROOT = path.join(os.tmpdir(), 'weapp-tailwindcss-template-locks')
const LOCK_UPDATE_TIMEOUT_MS = 30 * 60_000
const DEFAULT_YARN_VERSION = '1.22.22'
const COPY_IGNORE_DIRS = new Set(['node_modules', '.git', '.idea', '.turbo', 'dist'])
const tailwindVersionCache = new Map<string, string>()
const latestVersionCache = new Map<string, string>()
const ROOT_PNPM_PACKAGE_MANAGER = readRootPnpmPackageManager()

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

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function readRootPnpmPackageManager(): string | null {
  const pkgPath = path.join(ROOT, 'package.json')
  if (!existsSync(pkgPath)) {
    return null
  }
  try {
    const content = readFileSync(pkgPath, 'utf8')
    const pkg = JSON.parse(content) as { packageManager?: string }
    if (typeof pkg.packageManager === 'string' && pkg.packageManager.startsWith('pnpm')) {
      return pkg.packageManager
    }
  }
  catch {
    // 忽略读取失败，按未配置处理
  }
  return null
}

function readWorkspacePackageVersion(relativeDir: string): string {
  const pkgPath = path.join(ROOT, relativeDir, 'package.json')
  const pkgRaw = readFileSync(pkgPath, 'utf8')
  const pkg = JSON.parse(pkgRaw) as { version: string }
  return pkg.version
}

const MERGE_PACKAGES = {
  v4: {
    name: '@weapp-tailwindcss/merge',
    version: readWorkspacePackageVersion(path.join('packages-runtime', 'merge')),
  },
  v3: {
    name: '@weapp-tailwindcss/merge-v3',
    version: readWorkspacePackageVersion(path.join('packages-runtime', 'merge-v3')),
  },
} as const

const MERGE_PACKAGE_NAMES = [MERGE_PACKAGES.v4.name, MERGE_PACKAGES.v3.name] as const

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

function removePackageReferences(pkg: PackageJson, names: string[]): boolean {
  if (!names.length) {
    return false
  }
  let changed = false
  for (const field of ['dependencies', 'devDependencies'] as const) {
    const section = pkg[field]
    if (!section || typeof section !== 'object') {
      continue
    }
    const typedSection = section as Record<string, string>
    let sectionChanged = false
    for (const name of names) {
      if (name in typedSection) {
        delete typedSection[name]
        changed = true
        sectionChanged = true
      }
    }
    if (sectionChanged && Object.keys(typedSection).length === 0) {
      delete pkg[field]
    }
  }
  return changed
}

function collectMergePackagesToRemove(pkg: PackageJson, keep?: string): string[] {
  return MERGE_PACKAGE_NAMES.filter(name => name !== keep && hasPackageReference(pkg, name))
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

function arraysShallowEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((item, index) => item === b[index])
}

function ensurePnpmOnlyBuiltDependencies(
  pkg: PackageJson,
  targets: TargetPackage[],
  manager: ManagerInfo,
  remove: string[] = [],
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

  const removal = new Set(remove)
  const hasWork = required.length > 0 || removal.size > 0

  if (!hasWork) {
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
  const originalOnlyBuilt = Array.isArray(rawOnlyBuilt)
    ? rawOnlyBuilt.filter((item): item is string => typeof item === 'string')
    : []

  if (Array.isArray(rawOnlyBuilt) && originalOnlyBuilt.length !== rawOnlyBuilt.length) {
    changed = true
  }
  else if (!Array.isArray(rawOnlyBuilt) && rawOnlyBuilt !== undefined) {
    changed = true
  }

  const onlyBuilt = originalOnlyBuilt.filter(name => !removal.has(name))
  if (onlyBuilt.length !== originalOnlyBuilt.length) {
    changed = true
  }

  for (const name of required) {
    if (!onlyBuilt.includes(name)) {
      onlyBuilt.push(name)
      changed = true
    }
  }

  if (onlyBuilt.length === 0 && !required.length) {
    if ('onlyBuiltDependencies' in config) {
      delete config.onlyBuiltDependencies
      changed = true
    }
    if (Object.keys(config).length === 0) {
      delete pkg.pnpm
      changed = true
    }
    return changed
  }

  if (!Array.isArray(rawOnlyBuilt) || !arraysShallowEqual(onlyBuilt, originalOnlyBuilt)) {
    config.onlyBuiltDependencies = onlyBuilt
    if (!changed) {
      changed = true
    }
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

async function resolveTailwindTargets(pkg: PackageJson): Promise<TailwindResolution> {
  const range = getPackageRange(pkg, 'tailwindcss')
  if (!range || isExternalSpecifier(range)) {
    return {
      targets: [],
      removePackages: collectMergePackagesToRemove(pkg),
    }
  }
  const min = minVersion(range)
  if (!min) {
    return {
      targets: [],
      removePackages: collectMergePackagesToRemove(pkg),
    }
  }
  const major = min.major

  if (major === 3) {
    const version = await fetchTailwindVersion('tailwindcss', 3)
    const targets: TargetPackage[] = [
      {
        name: 'tailwindcss',
        version,
        range: `^${version}`,
      },
      {
        name: MERGE_PACKAGES.v3.name,
        version: MERGE_PACKAGES.v3.version,
        range: `^${MERGE_PACKAGES.v3.version}`,
        addIfMissing: 'dependencies',
        ensurePnpmOnlyBuilt: true,
      },
    ]
    return {
      targets,
      removePackages: collectMergePackagesToRemove(pkg, MERGE_PACKAGES.v3.name),
    }
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

    targets.push({
      name: MERGE_PACKAGES.v4.name,
      version: MERGE_PACKAGES.v4.version,
      range: `^${MERGE_PACKAGES.v4.version}`,
      addIfMissing: 'dependencies',
      ensurePnpmOnlyBuilt: true,
    })

    return {
      targets,
      removePackages: collectMergePackagesToRemove(pkg, MERGE_PACKAGES.v4.name),
    }
  }

  return {
    targets: [],
    removePackages: collectMergePackagesToRemove(pkg),
  }
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

function getLockfileName(manager: ManagerInfo): string {
  if (manager.name === 'pnpm') {
    return 'pnpm-lock.yaml'
  }
  if (manager.name === 'yarn') {
    return 'yarn.lock'
  }
  return 'package-lock.json'
}

function shouldUpdateLockfile(templateDir: string, manager: ManagerInfo, depsChanged: boolean): boolean {
  if (depsChanged) {
    return true
  }
  const lockPath = path.join(templateDir, getLockfileName(manager))
  return !existsSync(lockPath)
}

function shouldCopyEntry(templateDir: string, source: string): boolean {
  if (source === templateDir) {
    return true
  }
  const relative = path.relative(templateDir, source)
  if (!relative || relative.startsWith('..')) {
    return true
  }
  const segments = relative.split(path.sep).filter(Boolean)
  return !segments.some(segment => COPY_IGNORE_DIRS.has(segment))
}

function createTemplateSandbox(templateDir: string): { directory: string, cleanup: () => void } {
  ensureDir(TEMP_LOCK_ROOT)
  const prefix = path.join(TEMP_LOCK_ROOT, `${path.basename(templateDir)}-`)
  const tempRoot = mkdtempSync(prefix)
  const sandboxDir = path.join(tempRoot, 'template')
  cpSync(templateDir, sandboxDir, {
    recursive: true,
    filter: source => shouldCopyEntry(templateDir, source),
  })
  return {
    directory: sandboxDir,
    cleanup: () => {
      rmSync(tempRoot, { recursive: true, force: true })
    },
  }
}

async function regenerateLockfile(templateDir: string, manager: ManagerInfo): Promise<boolean> {
  const { directory, cleanup } = createTemplateSandbox(templateDir)
  const relative = path.relative(ROOT, templateDir) || templateDir
  try {
    let success = false
    if (manager.name === 'pnpm') {
      success = await runCommand(
        'pnpm',
        ['install', '--lockfile-only', '--ignore-scripts'],
        directory,
        { allowFailure: true, timeoutMs: LOCK_UPDATE_TIMEOUT_MS },
      )
    }
    else if (manager.name === 'npm') {
      success = await runCommand(
        'npm',
        ['install', '--package-lock-only', '--ignore-scripts'],
        directory,
        { allowFailure: true, timeoutMs: LOCK_UPDATE_TIMEOUT_MS },
      )
    }
    else {
      const yarnVersion = manager.version ?? DEFAULT_YARN_VERSION
      const yarnMajor = Number.parseInt((yarnVersion.split('.')[0] ?? '1') as string, 10)
      const yarnCacheDir = path.join(directory, '.yarn-cache')
      ensureDir(yarnCacheDir)
      const args = [
        'dlx',
        `yarn@${yarnVersion}`,
        'install',
        '--ignore-scripts',
        '--non-interactive',
      ]
      if (Number.isFinite(yarnMajor) && yarnMajor >= 2) {
        args.push('--mode=update-lockfile')
      }
      else {
        args.push('--prefer-offline', '--no-progress')
      }
      args.push('--cache-folder', yarnCacheDir)
      success = await runCommand(
        'pnpm',
        args,
        directory,
        {
          allowFailure: true,
          timeoutMs: LOCK_UPDATE_TIMEOUT_MS,
          env: {
            YARN_CACHE_FOLDER: yarnCacheDir,
          },
        },
      )
    }

    if (!success) {
      console.warn(`跳过为 ${relative} 更新 ${getLockfileName(manager)}，请在联网环境中手动刷新锁文件。`)
      return false
    }

    const lockName = getLockfileName(manager)
    const generated = path.join(directory, lockName)
    if (!existsSync(generated)) {
      console.warn(`未能在隔离环境中生成 ${lockName}，请在 ${relative} 内手动运行包管理器更新锁文件。`)
      return false
    }

    const content = readFileSync(generated, 'utf8')
    writeFileSync(path.join(templateDir, lockName), content)
    return true
  }
  finally {
    cleanup()
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
  const tailwindResolution = await resolveTailwindTargets(pkg)
  const relevantTargets = dedupeTargets([
    ...filterTargetsForPackage(pkg, baseTargets),
    ...tailwindResolution.targets,
  ])
  const manager = detectManager(templateDir, pkg)

  let packageManagerChanged = false
  if (manager.name === 'pnpm' && ROOT_PNPM_PACKAGE_MANAGER) {
    if (pkg.packageManager !== ROOT_PNPM_PACKAGE_MANAGER) {
      pkg.packageManager = ROOT_PNPM_PACKAGE_MANAGER
      packageManagerChanged = true
    }
  }

  const removalChanged = removePackageReferences(pkg, tailwindResolution.removePackages)
  const { changed: rangeChanged, touched: changedTargets } = updateDependencyRange(pkg, relevantTargets)
  const depsChanged = removalChanged || rangeChanged
  const pnpmChanged = ensurePnpmOnlyBuiltDependencies(
    pkg,
    relevantTargets,
    manager,
    tailwindResolution.removePackages,
  )

  if (depsChanged || pnpmChanged || packageManagerChanged) {
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, indent)}\n`)
  }

  let lockUpdated = false
  if (shouldUpdateLockfile(templateDir, manager, depsChanged)) {
    console.log(`更新 ${templateName} 的锁文件（${manager.name}）...`)
    lockUpdated = await regenerateLockfile(templateDir, manager)
  }

  if (rangeChanged) {
    changedTargets.forEach(target => summary.add(`${target.name}@${target.range}`))
  }

  return depsChanged || pnpmChanged || lockUpdated
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
      if (error instanceof Error) {
        error.message = `处理 ${name} 失败：${error.message}`
        throw error
      }
      throw new Error(`处理 ${name} 失败：${String(error)}`)
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
