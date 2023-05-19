const path = require('path')
const { run } = require('@icebreakers/cli')
const argvs = process.argv.slice(2)
const useLocal = argvs.indexOf('--local') > -1
;(async () => {
  const demoPath = path.resolve(__dirname, '../../demo')
  const result = []
  try {
    await run(demoPath, `build${useLocal ? ':local' : ''}`, true)
  } catch (error) {
    result.push(error)
  }
  if (result.length) {
    console.log(result)
  }
})()
