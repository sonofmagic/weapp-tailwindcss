const path = require('path')
const { run } = require('@icebreakers/cli')
const argvs = process.argv.slice(2)
const useLocal = argvs.indexOf('--local') > -1
;(async () => {
  const demoPath = path.resolve(__dirname, '../../demo')
  await run(demoPath, `build${useLocal ? ':local' : ''}`, true)
})()
