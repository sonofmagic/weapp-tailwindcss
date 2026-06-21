import type { DoctorCheck, DoctorCheckStatus, DoctorOptions, DoctorReport, PackageJson } from './doctor/types'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import semver from 'semver'
import { WEAPP_TW_REQUIRED_NODE_VERSION_RANGE } from '@/constants'
import { CONFIG_FILES, FRAMEWORK_DEPS } from './doctor/constants'

function tryReadJson<T>(file: string): T | undefined {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T
  }
  catch {
    return undefined
  }
}

function findFirstExisting(cwd: string, files: string[]) {
  return files.find(file => existsSync(path.join(cwd, file)))
}

function readProjectPackageJson(cwd: string) {
  return tryReadJson<PackageJson>(path.join(cwd, 'package.json'))
}

function readDependencyVersion(cwd: string, packageName: string) {
  try {
    const requireFromCwd = createRequire(path.join(cwd, 'package.json'))
    const packageJsonPath = requireFromCwd.resolve(`${packageName}/package.json`)
    return tryReadJson<{ version?: string }>(packageJsonPath)?.version
  }
  catch {
    return undefined
  }
}

function collectDependencySpecs(pkg: PackageJson | undefined) {
  return {
    ...(pkg?.dependencies ?? {}),
    ...(pkg?.devDependencies ?? {}),
    ...(pkg?.optionalDependencies ?? {}),
    ...(pkg?.peerDependencies ?? {}),
  }
}

function detectPackageManager(cwd: string, pkg: PackageJson | undefined) {
  if (pkg?.packageManager) {
    return pkg.packageManager
  }
  if (existsSync(path.join(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm'
  }
  if (existsSync(path.join(cwd, 'package-lock.json'))) {
    return 'npm'
  }
  if (existsSync(path.join(cwd, 'yarn.lock'))) {
    return 'yarn'
  }
  return undefined
}

function detectFrameworks(deps: Record<string, string>) {
  return FRAMEWORK_DEPS
    .filter(([dependency]) => dependency in deps)
    .map(([, label]) => label)
}

function addCheck(checks: DoctorCheck[], check: DoctorCheck) {
  checks.push(check)
}

function summarizeChecks(checks: DoctorCheck[]): Record<DoctorCheckStatus, number> {
  return checks.reduce<Record<DoctorCheckStatus, number>>((summary, check) => {
    summary[check.status] += 1
    return summary
  }, { ok: 0, warn: 0, error: 0, info: 0 })
}

function hasDependency(deps: Record<string, string>, packageName: string) {
  return packageName in deps
}

function getMajorVersion(version: string | undefined) {
  if (!version) {
    return undefined
  }
  return semver.parse(version)?.major
}

function getDependencyMajor(deps: Record<string, string>, packageName: string) {
  const spec = deps[packageName]
  return spec ? semver.minVersion(spec)?.major : undefined
}

export function createDoctorReport(options: DoctorOptions = {}): DoctorReport {
  const cwd = path.resolve(options.cwd ?? process.cwd())
  const nodeVersion = options.nodeVersion ?? process.versions.node
  const pkg = readProjectPackageJson(cwd)
  const deps = collectDependencySpecs(pkg)
  const checks: DoctorCheck[] = []
  const packageManager = detectPackageManager(cwd, pkg)
  const frameworks = detectFrameworks(deps)
  const tailwindcssVersion = readDependencyVersion(cwd, 'tailwindcss')
  const weappTailwindcssVersion = readDependencyVersion(cwd, 'weapp-tailwindcss')
  const tailwindMajor = getMajorVersion(tailwindcssVersion) ?? getDependencyMajor(deps, 'tailwindcss')
  const tailwindConfig = findFirstExisting(cwd, CONFIG_FILES.tailwind)
  const postcssConfig = findFirstExisting(cwd, CONFIG_FILES.postcss)
  const viteConfig = findFirstExisting(cwd, CONFIG_FILES.vite)
  const webpackConfig = findFirstExisting(cwd, CONFIG_FILES.webpack)

  addCheck(checks, pkg
    ? {
        id: 'package-json',
        title: 'package.json',
        status: 'ok',
        message: '已找到项目 package.json。',
      }
    : {
        id: 'package-json',
        title: 'package.json',
        status: 'error',
        message: '当前目录没有 package.json。',
        suggestion: '请在项目根目录运行 doctor，或通过 --cwd 指向项目根目录。',
      })

  addCheck(checks, semver.satisfies(nodeVersion, WEAPP_TW_REQUIRED_NODE_VERSION_RANGE)
    ? {
        id: 'node-version',
        title: 'Node.js',
        status: 'ok',
        message: `当前 Node.js ${nodeVersion} 满足版本要求 ${WEAPP_TW_REQUIRED_NODE_VERSION_RANGE}。`,
      }
    : {
        id: 'node-version',
        title: 'Node.js',
        status: 'error',
        message: `当前 Node.js ${nodeVersion} 不满足版本要求 ${WEAPP_TW_REQUIRED_NODE_VERSION_RANGE}。`,
        suggestion: '请升级 Node.js 后再安装或构建 weapp-tailwindcss 项目。',
      })

  addCheck(checks, packageManager
    ? {
        id: 'package-manager',
        title: '包管理器',
        status: packageManager.startsWith('pnpm') ? 'ok' : 'info',
        message: `检测到 ${packageManager}。`,
      }
    : {
        id: 'package-manager',
        title: '包管理器',
        status: 'info',
        message: '未检测到 lockfile 或 packageManager 字段。',
      })

  addCheck(checks, hasDependency(deps, 'weapp-tailwindcss') || Boolean(weappTailwindcssVersion)
    ? {
        id: 'weapp-tailwindcss',
        title: 'weapp-tailwindcss',
        status: 'ok',
        message: `检测到 weapp-tailwindcss${weappTailwindcssVersion ? `@${weappTailwindcssVersion}` : ''}。`,
      }
    : {
        id: 'weapp-tailwindcss',
        title: 'weapp-tailwindcss',
        status: 'warn',
        message: '未在当前项目依赖中检测到 weapp-tailwindcss。',
        suggestion: '如果这是业务项目，请安装 weapp-tailwindcss 并确认命令运行在项目根目录。',
      })

  addCheck(checks, hasDependency(deps, 'tailwindcss') || Boolean(tailwindcssVersion)
    ? {
        id: 'tailwindcss',
        title: 'Tailwind CSS',
        status: 'ok',
        message: `检测到 tailwindcss${tailwindcssVersion ? `@${tailwindcssVersion}` : ''}。`,
      }
    : {
        id: 'tailwindcss',
        title: 'Tailwind CSS',
        status: 'error',
        message: '未检测到 tailwindcss。',
        suggestion: '请安装 tailwindcss，并确认依赖可以从当前项目解析。',
      })

  addCheck(checks, tailwindConfig
    ? {
        id: 'tailwind-config',
        title: 'Tailwind 配置',
        status: 'ok',
        message: `检测到 ${tailwindConfig}。`,
      }
    : {
        id: 'tailwind-config',
        title: 'Tailwind 配置',
        status: tailwindMajor === 4 ? 'info' : 'warn',
        message: '未检测到 tailwind.config.*。',
        suggestion: tailwindMajor === 4
          ? 'Tailwind CSS v4 可以采用 CSS-first 配置；复杂 content/source 场景请补充配置文件。'
          : '请确认 Tailwind content/source 配置能够覆盖小程序页面、组件和脚本文件。',
      })

  addCheck(checks, postcssConfig
    ? {
        id: 'postcss-config',
        title: 'PostCSS 配置',
        status: 'ok',
        message: `检测到 ${postcssConfig}。`,
      }
    : {
        id: 'postcss-config',
        title: 'PostCSS 配置',
        status: viteConfig ? 'info' : 'warn',
        message: '未检测到 postcss.config.*。',
        suggestion: '如果通过 PostCSS 接入，请补充 postcss.config.*；如果通过 Vite/Taro 插件接入，可忽略此项。',
      })

  if (tailwindMajor === 4 && postcssConfig && !hasDependency(deps, '@tailwindcss/postcss')) {
    addCheck(checks, {
      id: 'tailwindcss-v4-postcss',
      title: 'Tailwind v4 PostCSS',
      status: 'warn',
      message: 'Tailwind CSS v4 项目存在 PostCSS 配置，但未检测到 @tailwindcss/postcss。',
      suggestion: '如果 PostCSS 配置中仍直接使用 tailwindcss，请迁移到 @tailwindcss/postcss。',
    })
  }

  addCheck(checks, frameworks.length > 0
    ? {
        id: 'framework',
        title: '框架识别',
        status: 'ok',
        message: `检测到 ${frameworks.join(', ')}。`,
      }
    : {
        id: 'framework',
        title: '框架识别',
        status: 'info',
        message: '未从依赖中识别出 Taro、uni-app、MPX、Remax 或 Rax。',
      })

  addCheck(checks, viteConfig || webpackConfig
    ? {
        id: 'bundler-config',
        title: '构建器配置',
        status: 'ok',
        message: `检测到 ${[viteConfig, webpackConfig].filter(Boolean).join(', ')}。`,
      }
    : {
        id: 'bundler-config',
        title: '构建器配置',
        status: 'info',
        message: '未检测到 vite.config.* 或 webpack.config.*。',
      })

  return {
    cwd,
    nodeVersion,
    detected: {
      packageManager,
      frameworks,
      tailwindcssVersion,
      weappTailwindcssVersion,
    },
    summary: summarizeChecks(checks),
    checks,
  }
}

export function hasDoctorFailure(report: DoctorReport, strict = false) {
  return report.summary.error > 0 || (strict && report.summary.warn > 0)
}

export function formatDoctorReport(report: DoctorReport) {
  const lines = [
    `weapp-tailwindcss doctor`,
    `cwd: ${report.cwd}`,
    `summary: ${report.summary.error} error, ${report.summary.warn} warn, ${report.summary.ok} ok, ${report.summary.info} info`,
    '',
  ]

  for (const check of report.checks) {
    lines.push(`[${check.status}] ${check.title}: ${check.message}`)
    if (check.suggestion) {
      lines.push(`  -> ${check.suggestion}`)
    }
  }

  return lines.join('\n')
}
