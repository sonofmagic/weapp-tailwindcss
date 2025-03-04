import path from 'node:path'
import { run } from './run'

;

(async () => {
  const demoPath = path.resolve(import.meta.dirname, '../../demo')
  const result = []
  try {
    await run(demoPath, `yarn build`)
  }
  catch (error) {
    result.push(error)
  }
  if (result.length > 0) {
    console.log(result)
  }
})()
