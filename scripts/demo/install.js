import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { run } from './run.js'

const getFilename = () => fileURLToPath(import.meta.url)
const getDirname = () => path.dirname(getFilename())
const __dirname = /* @__PURE__ */ getDirname()

const argvs = new Set(process.argv.slice(2))
const isBeta = argvs.has('--beta')
const isAlpha = argvs.has('--alpha')
const isRc = argvs.has('--rc')
const version = isAlpha ? '@alpha' : isBeta ? '@beta' : isRc ? '@rc' : ''

  ; (async () => {
  const demoPath = path.resolve(__dirname, '../../demo')
  await run(demoPath, '--ignore-engines')
  // ${version}
  await run(
    demoPath,
    `add -D weapp-tailwindcss${version} @weapp-tailwindcss/cli tailwindcss-patch${isRc ? '@rc' : ''
    } tailwindcss-rem2px-preset@latest @weapp-tailwindcss/merge${version} postcss-rem-to-responsive-pixel@latest weapp-ide-cli@latest postcss-rpx-transform weapp-tailwindcss-children tailwind-css-variables-theme-generator tailwindcss@3 --ignore-engines`,
  )

  // await install(demoPath, '-D @icebreakers/weapp-tailwindcss-test-components', true)
})()
