const path = require('path')
const { install } = require('@icebreakers/cli')

;(async () => {
  const demoPath = path.resolve(__dirname, '../../demo')
  await install(demoPath, undefined, true)
  await install(demoPath, '-D weapp-tailwindcss-webpack-plugin@latest tailwindcss-rem2px-preset@latest postcss-rem-to-responsive-pixel@latest', true)

  await install(demoPath, '-D @icebreakers/weapp-tailwindcss-test-components', true)
})()
