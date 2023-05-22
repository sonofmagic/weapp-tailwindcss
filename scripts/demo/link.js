const path = require('node:path')
const { raw } = require('@icebreakers/cli')

;(async () => {
  const demoPath = path.resolve(__dirname, '../../demo')
  const packagesDir = path.resolve(demoPath, './packages')
  await raw(packagesDir, () => {
    return 'link'
  })
  await raw(
    demoPath,
    () => {
      return 'link @icebreakers/weapp-tailwindcss-test-components'
    },
    true
  )
  console.log('link @icebreakers/weapp-tailwindcss-test-components successfully!')
})()
