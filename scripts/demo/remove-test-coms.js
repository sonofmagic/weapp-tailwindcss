const path = require('path')
const { raw } = require('@icebreakers/cli')

;(async () => {
  const demoPath = path.resolve(__dirname, '../../demo')

  await raw(demoPath, 'remove @icebreakers/weapp-tailwindcss-test-components', true)
})()
