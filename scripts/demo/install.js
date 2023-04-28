const path = require('path')
const { install, raw } = require('@icebreakers/cli')
const argvs = process.argv.slice(2)
const isBeta = argvs.indexOf('--beta') > -1

;(async () => {
  const demoPath = path.resolve(__dirname, '../../demo')
  await raw(demoPath, '--ignore-engines', true)
  await install(
    demoPath,
    `-D weapp-tailwindcss-webpack-plugin${isBeta ? '@beta' : ''} tailwindcss-patch${
      isBeta ? '@rc' : ''
    } tailwindcss-rem2px-preset@latest postcss-rem-to-responsive-pixel@latest weapp-ide-cli@latest postcss-rpx-transform weapp-tailwindcss-children tailwind-css-variables-theme-generator --ignore-engines`,
    true
  )

  // await install(demoPath, '-D @icebreakers/weapp-tailwindcss-test-components', true)
})()
