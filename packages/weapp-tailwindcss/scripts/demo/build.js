const path = require('node:path')
const { run } = require('./run')
// const { run } = require('@icebreakers/cli')
const argvs = process.argv.slice(2)
const useLocal = argvs.includes('--local')
;(async () => {
  const demoPath = path.resolve(__dirname, '../../demo')
  const result = []
  try {
    await run(demoPath, `build${useLocal ? ':local' : ''}`)
  } catch (error) {
    result.push(error)
  }
  if (result.length > 0) {
    console.log(result)
  }
})()
