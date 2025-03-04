import path from 'node:path'
import process from 'node:process'
// import { gte } from 'semver'
import { run } from './run'

const argvs = new Set(process.argv.slice(2))
const isBeta = argvs.has('--beta')
const isAlpha = argvs.has('--alpha')
const isRc = argvs.has('--rc')
const version = isAlpha ? '@alpha' : isBeta ? '@beta' : isRc ? '@rc' : ''

  ; (async () => {
  const demoPath = path.resolve(import.meta.dirname, '../../demo')
  await run(demoPath, 'yarn --ignore-engines')
  // ${version}
  await run(
    demoPath,
    (pkgInfo) => {
      if (pkgInfo) {
        console.log(pkgInfo.rootPath, pkgInfo.packageJson.devDependencies?.tailwindcss)
      }

      return `yarn add -D weapp-tailwindcss${version} tailwindcss-patch${isRc ? '@rc' : ''
      } @weapp-tailwindcss/merge${version} weapp-ide-cli@latest tailwindcss@3 --ignore-engines`
    },
  )

  // await install(demoPath, '-D @icebreakers/weapp-tailwindcss-test-components', true)
})()
