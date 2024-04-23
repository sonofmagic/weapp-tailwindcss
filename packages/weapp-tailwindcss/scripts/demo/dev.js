const path = require('node:path')
const { run } = require('@icebreakers/cli')

  ; (async () => {
    const demoPath = path.resolve(__dirname, '../../demo')
    await run(demoPath, 'dev', true)
  })()
