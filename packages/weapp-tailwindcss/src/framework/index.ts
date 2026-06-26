import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

export type DetectableAppType = 'mpx' | 'taro' | 'uni-app' | 'uni-app-vite' | 'uni-app-x' | 'weapp-vite'

export type FrameworkEnv = Partial<Record<
  | 'MPX_CLI_MODE'
  | 'MPX_CURRENT_TARGET_MODE'
  | 'NODE_PATH'
  | 'TARO_ENV'
  | 'UNI_PLATFORM'
  | 'UNI_UTS_PLATFORM'
  | 'WEAPP_TAILWINDCSS_TARGET'
  | 'WEAPP_TW_TARGET',
  string | undefined
>>

export interface UniPlatformInfo {
  raw: string | undefined
  normalized: string | undefined
  isApp: boolean
  isAppAndroid: boolean
  isAppHarmony: boolean
  isAppIos: boolean
  isMp: boolean
  isWeb: boolean
}

export interface HBuilderXRuntimeHints {
  cwd?: string | undefined
  env?: FrameworkEnv | undefined
  nodePath?: string | null | undefined
}

export interface PackageJsonLike {
  'dependencies'?: Record<string, string> | undefined
  'devDependencies'?: Record<string, string> | undefined
  'peerDependencies'?: Record<string, string> | undefined
  'optionalDependencies'?: Record<string, string> | undefined
  'scripts'?: Record<string, string> | undefined
  'uni-app'?: unknown
}

export interface UniAppManifestLike {
  'uni-app-x'?: unknown
}

export interface DetectAppTypeOptions {
  /**
   * 项目根目录。传入后会读取 marker、manifest.json 与 package.json。
   */
  root?: string | undefined
  /**
   * 已解析的 package.json 内容。适合在调用方已经读取配置时复用。
   */
  packageJson?: PackageJsonLike | undefined
  /**
   * 已解析的 uni-app manifest.json 内容，用于识别 uni-app x。
   */
  manifest?: UniAppManifestLike | undefined
  /**
   * 是否从 root 向上查找 package.json 与 manifest.json。
   *
   * @default `true`
   */
  searchUp?: boolean | undefined
  /**
   * 环境变量快照。传入后可用于识别 HBuilderX、Taro、MPX 与 uni-app 运行环境。
   */
  env?: FrameworkEnv | undefined
  /**
   * 是否读取当前进程环境变量参与推断。
   *
   * @default `false`
   */
  detectEnv?: boolean | undefined
  /**
   * HBuilderX 插件运行时的工作目录。默认使用 `root`，启用 `detectEnv` 时会回退到 `process.cwd()`。
   */
  cwd?: string | undefined
  /**
   * 是否在 HBuilderX 插件运行时把 uni-app 识别为 uni-app Vite。
   *
   * @default `true`
   */
  hbuilderxVite?: boolean | undefined
}

const KNOWN_MAC_HBUILDERX_PLUGIN_DIRS = [
  '/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli-vite',
  '/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli',
] as const

const HBUILDERX_PLUGIN_CWD_RE
  = /[\\/]HBuilderX(?:\.[^\\/]*)?(?:[\\/]Contents[\\/]HBuilderX)?[\\/]plugins[\\/]uniapp-cli(?:-vite)?(?:[\\/]|$)/i
const PACKAGE_JSON_FILE = 'package.json'
const MANIFEST_JSON_FILE = 'manifest.json'
const MPX_SCRIPT_RE = /\bmpx(?:-cli-service)?\b/u
const TARO_SCRIPT_RE = /\btaro\b/u
const WEAPP_VITE_SCRIPT_RE = /\bweapp-vite\b/u
const UNI_APP_SCRIPT_RE = /\buni(?:\s|$)/u
const UNI_APP_VITE_SCRIPT_RE = /\buni(?:\s|$)/u
const MPX_MARKERS: Array<[string, DetectableAppType]> = [
  ['src/app.mpx', 'mpx'],
  ['app.mpx', 'mpx'],
]

function getProcessEnv(): FrameworkEnv {
  return {
    MPX_CLI_MODE: process.env['MPX_CLI_MODE'],
    MPX_CURRENT_TARGET_MODE: process.env['MPX_CURRENT_TARGET_MODE'],
    NODE_PATH: process.env['NODE_PATH'],
    TARO_ENV: process.env['TARO_ENV'],
    UNI_PLATFORM: process.env['UNI_PLATFORM'],
    UNI_UTS_PLATFORM: process.env['UNI_UTS_PLATFORM'],
    WEAPP_TAILWINDCSS_TARGET: process.env['WEAPP_TAILWINDCSS_TARGET'],
    WEAPP_TW_TARGET: process.env['WEAPP_TW_TARGET'],
  }
}

function resolveDependencyNames(pkg: PackageJsonLike) {
  return new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
    ...Object.keys(pkg.optionalDependencies ?? {}),
  ])
}

function hasDependencyPrefix(dependencyNames: Set<string>, prefix: string) {
  return [...dependencyNames].some(name => name.startsWith(prefix))
}

function hasScriptMatch(pkg: PackageJsonLike, pattern: RegExp) {
  return Object.values(pkg.scripts ?? {}).some(script => pattern.test(script))
}

function normalizePlatform(value: string | undefined) {
  return value?.trim().toLowerCase() || undefined
}

function resolvePlatformInfo(value: string | undefined): UniPlatformInfo {
  const normalized = normalizePlatform(value)
  const isAppAndroid = normalized === 'app-android'
  const isAppIos = normalized === 'app-ios'
  const isAppHarmony = normalized === 'app-harmony'
  const isApp = normalized?.startsWith('app-') === true || normalized === 'app' || normalized === 'app-plus'
  const isMp = normalized?.startsWith('mp-') === true
  const isWeb = normalized?.startsWith('web') === true || normalized === 'h5'

  return {
    raw: value,
    normalized,
    isApp,
    isAppAndroid,
    isAppHarmony,
    isAppIos,
    isMp,
    isWeb,
  }
}

function hasKnownHBuilderXPluginPrefix(normalizedCwd: string) {
  for (const dir of KNOWN_MAC_HBUILDERX_PLUGIN_DIRS) {
    const normalizedDir = path.normalize(dir)
    if (normalizedCwd === normalizedDir || normalizedCwd.startsWith(`${normalizedDir}${path.sep}`)) {
      return true
    }
  }
  return false
}

function matchesHBuilderXPluginCwd(cwd: string) {
  const normalized = path.normalize(cwd)
  if (hasKnownHBuilderXPluginPrefix(normalized)) {
    return true
  }
  return HBUILDERX_PLUGIN_CWD_RE.test(normalized)
}

export function isRunningInHBuilderX(options: HBuilderXRuntimeHints = {}) {
  const env = options.env ?? getProcessEnv()
  const nodePath = 'nodePath' in options ? options.nodePath : env.NODE_PATH
  const nodePathMissing = nodePath == null || nodePath.trim().length === 0
  if (!nodePathMissing) {
    return false
  }
  return matchesHBuilderXPluginCwd(options.cwd ?? process.cwd())
}

export function resolvePlatform(value: string | undefined) {
  return resolvePlatformInfo(value)
}

export function resolveUniPlatform(value: string | undefined) {
  return resolvePlatform(value)
}

export function resolveUniUtsPlatform(value: string | undefined) {
  return resolvePlatform(value)
}

export function resolveUniPlatformsFromEnv(env: FrameworkEnv = getProcessEnv()) {
  return {
    uniPlatform: resolveUniPlatform(env.UNI_PLATFORM),
    uniUtsPlatform: resolveUniUtsPlatform(env.UNI_UTS_PLATFORM),
  }
}

export function detectAppTypeFromEnv(env: FrameworkEnv = getProcessEnv(), options: { cwd?: string | undefined, hbuilderxVite?: boolean | undefined } = {}): DetectableAppType | undefined {
  if (env.WEAPP_TW_TARGET === 'weapp-vite' || env.WEAPP_TAILWINDCSS_TARGET === 'weapp-vite') {
    return 'weapp-vite'
  }

  if (env.TARO_ENV) {
    return 'taro'
  }

  if (env.MPX_CLI_MODE || env.MPX_CURRENT_TARGET_MODE) {
    return 'mpx'
  }

  const { uniPlatform, uniUtsPlatform } = resolveUniPlatformsFromEnv(env)
  if (uniUtsPlatform.normalized) {
    return 'uni-app-x'
  }

  if (uniPlatform.normalized) {
    return 'uni-app-vite'
  }

  if (isRunningInHBuilderX({ cwd: options.cwd, env })) {
    return options.hbuilderxVite === false ? 'uni-app' : 'uni-app-vite'
  }
}

export function isWeappVitePackage(pkg: PackageJsonLike) {
  const dependencyNames = resolveDependencyNames(pkg)
  return dependencyNames.has('weapp-vite')
    || hasDependencyPrefix(dependencyNames, '@weapp-vite/')
    || hasScriptMatch(pkg, WEAPP_VITE_SCRIPT_RE)
}

export function isMpxPackage(pkg: PackageJsonLike) {
  const dependencyNames = resolveDependencyNames(pkg)
  return hasDependencyPrefix(dependencyNames, '@mpxjs/')
    || hasScriptMatch(pkg, MPX_SCRIPT_RE)
}

export function isTaroPackage(pkg: PackageJsonLike) {
  const dependencyNames = resolveDependencyNames(pkg)
  return hasDependencyPrefix(dependencyNames, '@tarojs/')
    || hasScriptMatch(pkg, TARO_SCRIPT_RE)
}

export function isUniAppVitePackage(pkg: PackageJsonLike) {
  return resolveDependencyNames(pkg).has('@dcloudio/vite-plugin-uni')
    || hasScriptMatch(pkg, UNI_APP_VITE_SCRIPT_RE)
}

export function isUniAppXPackage(pkg: PackageJsonLike) {
  const dependencyNames = resolveDependencyNames(pkg)
  return dependencyNames.has('@dcloudio/uni-uts-v1')
    || dependencyNames.has('@weapp-tailwindcss/debug-uni-app-x')
}

export function isUniAppPackage(pkg: PackageJsonLike) {
  const dependencyNames = resolveDependencyNames(pkg)
  return dependencyNames.has('@dcloudio/vue-cli-plugin-uni')
    || dependencyNames.has('@dcloudio/uni-app')
    || Object.hasOwn(pkg, 'uni-app')
    || hasScriptMatch(pkg, UNI_APP_SCRIPT_RE)
}

export function isUniAppXManifest(manifest: UniAppManifestLike | undefined) {
  return Boolean(manifest && Object.hasOwn(manifest, 'uni-app-x'))
}

export function detectAppTypeFromPackageJson(pkg: PackageJsonLike): DetectableAppType | undefined {
  if (isWeappVitePackage(pkg)) {
    return 'weapp-vite'
  }
  if (isMpxPackage(pkg)) {
    return 'mpx'
  }
  if (isTaroPackage(pkg)) {
    return 'taro'
  }
  if (isUniAppXPackage(pkg)) {
    return 'uni-app-x'
  }
  if (isUniAppVitePackage(pkg)) {
    return 'uni-app-vite'
  }
  if (isUniAppPackage(pkg)) {
    return 'uni-app'
  }
}

function tryReadJson<T>(file: string): T | undefined {
  if (!existsSync(file)) {
    return
  }

  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T
  }
  catch {

  }
}

function detectAppTypeFromMarkers(root: string): DetectableAppType | undefined {
  for (const [relativePath, appType] of MPX_MARKERS) {
    if (existsSync(path.join(root, relativePath))) {
      return appType
    }
  }
}

function detectAppTypeFromRoot(root: string, searchUp = true): DetectableAppType | undefined {
  const resolvedRoot = path.resolve(root)
  if (!existsSync(resolvedRoot)) {
    return
  }

  const markerDetected = detectAppTypeFromMarkers(resolvedRoot)
  if (markerDetected) {
    return markerDetected
  }

  let current = resolvedRoot
  while (true) {
    const manifest = tryReadJson<UniAppManifestLike>(path.join(current, MANIFEST_JSON_FILE))
    if (isUniAppXManifest(manifest)) {
      return 'uni-app-x'
    }

    const pkg = tryReadJson<PackageJsonLike>(path.join(current, PACKAGE_JSON_FILE))
    if (pkg) {
      const detected = detectAppTypeFromPackageJson(pkg)
      if (detected) {
        return detected
      }
    }

    if (!searchUp) {
      break
    }
    const parent = path.dirname(current)
    if (parent === current) {
      break
    }
    current = parent
  }
}

export function detectAppType(options: DetectAppTypeOptions = {}): DetectableAppType | undefined {
  if (isUniAppXManifest(options.manifest)) {
    return 'uni-app-x'
  }

  if (options.packageJson) {
    const detected = detectAppTypeFromPackageJson(options.packageJson)
    if (detected) {
      return detected
    }
  }

  if (options.root) {
    const detected = detectAppTypeFromRoot(options.root, options.searchUp ?? true)
    if (detected) {
      return detected
    }
  }

  const env = options.env ?? (options.detectEnv ? getProcessEnv() : undefined)
  if (env) {
    return detectAppTypeFromEnv(env, {
      cwd: options.cwd ?? options.root ?? (options.detectEnv ? process.cwd() : undefined),
      hbuilderxVite: options.hbuilderxVite,
    })
  }
}

export const resolveImplicitAppTypeFromViteRoot = (root: string) => detectAppType({ root })
