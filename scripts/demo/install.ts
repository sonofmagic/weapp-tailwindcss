import path from 'node:path'
import process from 'node:process'
import boxen from 'boxen'
import { trimStart } from 'es-toolkit'
import pc from 'picocolors'
import { coerce, gte } from 'semver'
import { detectPackageManager, run } from './run'

const argvs = new Set(process.argv.slice(2))
const isBeta = argvs.has('--beta')
const isAlpha = argvs.has('--alpha')
const isRc = argvs.has('--rc')

function formatArgs(entries: Array<[string, string]>) {
  return entries.map(([name, version]) => {
    return `${name}${version ? `@${version}` : ''}`
  }).join(' ')
}

function shouldInstallDependency(opts: {
  current?: string
  wanted: string
}): boolean {
  const { current, wanted } = opts
  if (!current) {
    return true
  }
  if (!wanted || wanted === 'latest') {
    return false
  }
  if (wanted === 'rc' || wanted === 'beta' || wanted === 'alpha') {
    return !current.includes(wanted)
  }
  if (/^\d+$/.test(wanted)) {
    const desiredMajor = Number.parseInt(wanted, 10)
    const cleaned = current
      .replace(/^workspace:/, '')
      .replace(/^[~^><=]*/, '')
    const currentVersion = coerce(cleaned)
    if (!Number.isFinite(desiredMajor) || desiredMajor < 0) {
      return false
    }
    if (!currentVersion) {
      return true
    }
    return currentVersion.major !== desiredMajor
  }
  return !current.includes(wanted)
}

const version = isAlpha ? 'alpha' : isBeta ? 'beta' : isRc ? 'rc' : ''

  ; (async () => {
  const demoPath = path.resolve(import.meta.dirname, '../../demo')
  const packageManager = await detectPackageManager(demoPath)

  if (packageManager === 'yarn') {
    await run(demoPath, 'yarn --ignore-engines')
  }
  // ${version}
  await run(
    demoPath,
    (pkgInfo) => {
      const pkgMap: Record<string, string> = {
        'weapp-tailwindcss': version,
        '@weapp-tailwindcss/merge': 'latest', // version,
        'weapp-ide-cli': 'latest',
        'tailwindcss': '',
        'tailwindcss-patch': isRc ? 'rc' : '',
      }

      if (pkgInfo) {
        if (pkgInfo.packageJson.devDependencies) {
          let tailwindcssVersion = pkgInfo.packageJson.devDependencies?.tailwindcss
          if (tailwindcssVersion) {
            if (tailwindcssVersion.length === 1) {
              tailwindcssVersion = `${tailwindcssVersion}.0.0`
            }
            if (!gte(trimStart(tailwindcssVersion, '^'), '4.0.0')) {
              pkgMap.tailwindcss = '3'
            }
          }
          if (Reflect.has(pkgInfo.packageJson.devDependencies, '@tailwindcss/postcss')) {
            pkgMap['@tailwindcss/postcss'] = ''
          }
          if (Reflect.has(pkgInfo.packageJson.devDependencies, '@tailwindcss/vite')) {
            pkgMap['@tailwindcss/vite'] = ''
          }
        }
      }
      const dependencies: Record<string, string | undefined> = {
        ...(pkgInfo?.packageJson.dependencies ?? {}),
        ...(pkgInfo?.packageJson.devDependencies ?? {}),
        ...(pkgInfo?.packageJson.optionalDependencies ?? {}),
      }
      const entries = Object.entries(pkgMap).filter(([name, wanted]) => {
        const current = dependencies[name]
        return shouldInstallDependency({
          current,
          wanted,
        })
      })

      if (entries.length === 0) {
        console.log(
          boxen(
            `${pc.bold(
              pc.greenBright(
                path.relative(
                  demoPath,
                  pkgInfo!.rootPath!,
                ),
              ),
            )}\n\n${pc.dim('dependencies already up to date')}`,
            {
              padding: 1,
            },
          ),
        )
        return null
      }

      const args = formatArgs(entries)
      console.log(
        boxen(
          `${pc.bold(
            pc.greenBright(
              path.relative(
                demoPath,
                pkgInfo!.rootPath!,
              ),
            ),
          )}\n\n${args}`,
          {
            padding: 1,
          },
        ),
      )
      return `yarn add -D ${args} --ignore-engines`
    },
  )
})()
