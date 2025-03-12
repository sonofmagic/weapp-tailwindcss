import path from 'node:path'
import process from 'node:process'
import boxen from 'boxen'
import { trimStart } from 'es-toolkit'
import { gte } from 'semver'
import { run } from './run'

const argvs = new Set(process.argv.slice(2))
const isBeta = argvs.has('--beta')
const isAlpha = argvs.has('--alpha')
const isRc = argvs.has('--rc')

function getArgs(map: Record<string, string>) {
  return Object.entries(map).map(([name, version]) => {
    return `${name}${version ? `@${version}` : ''}`
  }).join(' ')
}

const version = isAlpha ? 'alpha' : isBeta ? 'beta' : isRc ? 'rc' : ''

  ; (async () => {
  const demoPath = path.resolve(import.meta.dirname, '../../demo')
  await run(demoPath, 'yarn --ignore-engines')
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
      const args = getArgs(pkgMap)
      console.log(boxen(`${path.relative(demoPath, pkgInfo!.rootPath!)}\n${args}`))
      return `yarn add -D ${args} --ignore-engines`
    },
  )
})()
