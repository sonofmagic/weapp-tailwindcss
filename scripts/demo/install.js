const path = require('node:path')
const { run } = require('./run')
// const { install, raw } = require('@icebreakers/cli')
const argvs = new Set(process.argv.slice(2))
const isBeta = argvs.has('--beta')
const isAlpha = argvs.has('--alpha')
const isRc = argvs.has('--rc')
const version = isAlpha ? '@alpha' : isBeta ? '@beta' : isRc ? '@rc' : ''

;(async () => {
  const demoPath = path.resolve(__dirname, '../../demo')
  await run(demoPath, '--ignore-engines')
  // weapp-tailwindcss-webpack-plugin${isBeta ? '@beta' : ''}
  await run(
    demoPath,
    `add -D weapp-tailwindcss${version} @weapp-tailwindcss/cli${version} tailwindcss-patch${
      isRc ? '@rc' : ''
    } tailwindcss-rem2px-preset@latest postcss-rem-to-responsive-pixel@latest weapp-ide-cli@latest postcss-rpx-transform weapp-tailwindcss-children tailwind-css-variables-theme-generator tailwindcss@latest --ignore-engines`
  )

  // await install(demoPath, '-D @icebreakers/weapp-tailwindcss-test-components', true)
})()
