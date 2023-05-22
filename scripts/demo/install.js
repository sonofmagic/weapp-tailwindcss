const path = require('node:path')
const { install, raw } = require('@icebreakers/cli')
const argvs = new Set(process.argv.slice(2))
const isBeta = argvs.has('--beta')
const isRc = argvs.has('--rc')
;(async () => {
  const demoPath = path.resolve(__dirname, '../../demo')
  await raw(demoPath, '--ignore-engines', true)
  await install(
    demoPath,
    `-D weapp-tailwindcss-webpack-plugin${isBeta ? '@beta' : ''} tailwindcss-patch${
      isRc ? '@rc' : ''
    } tailwindcss-rem2px-preset@latest postcss-rem-to-responsive-pixel@latest weapp-ide-cli@latest postcss-rpx-transform weapp-tailwindcss-children tailwind-css-variables-theme-generator --ignore-engines`,
    true
  )

  // await install(demoPath, '-D @icebreakers/weapp-tailwindcss-test-components', true)
})()
