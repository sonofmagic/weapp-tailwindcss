const path = require('node:path')
const { run } = require('./run')
// const { run } = require('@icebreakers/cli')
;(async () => {
  const demoPath = path.resolve(__dirname, '../../demo')
  const result = []
  try {
    const divide = '-'.repeat(process.stdout.columns)
    for (let i = 0; i < 2; i++) {
      console.log(divide)
      console.log(i)
      console.log(divide)
      await run(demoPath, `build`)
      console.log(divide)
      console.log(i)
      console.log(divide)
      await run(demoPath, `build:babel`)
      console.log(divide)
      console.log(i)
      console.log(divide)
    }
  } catch (error) {
    result.push(error)
  }
  if (result.length > 0) {
    console.log(result)
  }
})()
