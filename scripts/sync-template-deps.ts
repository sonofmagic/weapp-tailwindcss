import {
  existsSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import { minVersion } from 'semver'
import { ROOT } from './template-utils'

type PackageJson = Record<string, unknown> & {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  packageManager?: string
}

type Manager = 'pnpm' | 'yarn' | 'npm'

interface ManagerInfo {
  name: Manager
  version?: string | null
}

interface TargetPackage {
  name: string
  version: string
  range: string
}

const TEMPLATES_DIR = path.join(ROOT, 'templates')
const WORKSPACE_MANIFEST = path.join(ROOT, 'pnpm-workspace.yaml')
const tailwindVersionCache = new Map<string, string>()

function readRootWeappTailwindcssVersion(): string {
  const pkgPath = path.join(ROOT, 'packages', 'weapp-tailwindcss', 'package.json')
  const pkgRaw = readFileSync(pkgPath, 'utf8')
  const pkg = JSON.parse(pkgRaw) as { version: string }
  return pkg.version
}

async function fetchLatestVersion(pkgName: string): Promise<string> {
  const { stdout } = await execa('pnpm', ['view', pkgName, 'version', '--json'], {
    cwd: ROOT,
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
  const weappTailwindcssVersion = readRootWeappTailwindcssVersion()
  const weappIdeCliVersion = await fetchLatestVersion('weapp-ide-cli')
  return [
    {
      name: 'weapp-tailwindcss',
      version: weappTailwindcssVersion,
      range: `^${weappTailwindcssVersion}`,
    },
    {
      name: 'weapp-ide-cli',
      version: weappIdeCliVersion,
      range: `^${weappIdeCliVersion}`,
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
    if (prefix === '' && target.range.startsWith('workspace:')) {
      return target.range
    }
    return `${prefix}${targetVersion}`
  }

  if (prefix === '' && target.range.startsWith('workspace:')) {
    return target.range
  }

  return `${prefix || ''}${targetVersion}`
}

function updateDependencyRange(pkg: PackageJson, targets: TargetPackage[]): boolean {
  let updated = false
  for (const field of ['dependencies', 'devDependencies'] as const) {
    const section = pkg[field]
    if (!section || typeof section !== 'object') {
      continue
    }
    for (const target of targets) {
      if (target.name in section) {
        const current = section[target.name]
        const next = buildVersionRange(current, target)
        if (current !== next) {
          section[target.name] = next
          updated = true
        }
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

function hasPackageReference(pkg: PackageJson, name: string): boolean {
  const deps = pkg.dependencies ?? {}
  const devDeps = pkg.devDependencies ?? {}
  return Boolean((deps as Record<string, string>)[name] ?? (devDeps as Record<string, string>)[name])
}

function filterTargetsForPackage(pkg: PackageJson, targets: TargetPackage[]): TargetPackage[] {
  return targets.filter(target => hasPackageReference(pkg, target.name))
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
  }: { allowFailure?: boolean, env?: NodeJS.ProcessEnv } = {},
): Promise<boolean> {
  try {
    await execa(command, args, {
      cwd,
      stdio: 'inherit',
      env: {
        ...process.env,
        CI: '1',
        ...env,
      },
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

async function withWorkspaceIsolation<T>(operation: () => Promise<T> | T): Promise<T> {
  if (!existsSync(WORKSPACE_MANIFEST)) {
    return await Promise.resolve(operation())
  }

  const tempPath = `${WORKSPACE_MANIFEST}.bak.${Date.now()}.${Math.random().toString(16).slice(2)}`
  renameSync(WORKSPACE_MANIFEST, tempPath)
  try {
    return await Promise.resolve(operation())
  }
  finally {
    renameSync(tempPath, WORKSPACE_MANIFEST)
  }
}

async function updateLockfile(templateDir: string, manager: ManagerInfo): Promise<void> {
  const env = { PNPM_WORKSPACE_DIR: templateDir }

  if (manager.name === 'pnpm') {
    await withWorkspaceIsolation(() =>
      runCommand('pnpm', ['install', '--lockfile-only', '--ignore-scripts'], templateDir, {
        env,
      }),
    )
    return
  }

  if (manager.name === 'npm') {
    await withWorkspaceIsolation(() =>
      runCommand('npm', ['install', '--package-lock-only', '--ignore-scripts'], templateDir, {
        env,
      }),
    )
    return
  }

  const yarnVersion = manager.version ?? '1.22.22'
  const baseArgs = ['dlx', `yarn@${yarnVersion}`, 'install', '--ignore-scripts', '--non-interactive']

  const updated = await withWorkspaceIsolation(() =>
    runCommand(
      'pnpm',
      [...baseArgs.slice(0, -2), '--mode=update-lockfile', ...baseArgs.slice(-2)],
      templateDir,
      {
        allowFailure: true,
        env,
      },
    ),
  )

  if (!updated) {
    const fallback = await withWorkspaceIsolation(() =>
      runCommand('pnpm', baseArgs, templateDir, {
        allowFailure: false,
        env,
      }),
    )
    if (!fallback) {
      throw new Error(`更新 ${templateDir} 的 yarn.lock 失败`)
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
  const changed = updateDependencyRange(pkg, relevantTargets)
  const needLock = lockNeedsUpdate(templateDir, manager, relevantTargets)

  if (!changed && !needLock) {
    return false
  }

  if (changed) {
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, indent)}\n`)
  }

  if (relevantTargets.length > 0) {
    console.log(`更新 ${templateName} 使用 ${manager.name} 生成锁文件...`)
    await updateLockfile(templateDir, manager)
    relevantTargets.forEach(target => summary.add(`${target.name}@${target.range}`))
  }

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
