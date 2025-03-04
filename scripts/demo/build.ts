import path from 'node:path'
import process from 'node:process'
import { run } from './run'

const argvs = process.argv.slice(2)
const useBabel = argvs.includes('--babel')

  ; (async () => {
  const demoPath = path.resolve(import.meta.dirname, '../../demo')
  const result = []
  try {
    await run(demoPath, `yarn build${useBabel ? ':babel' : ''}`)
  }
  catch (error) {
    result.push(error)
  }
  if (result.length > 0) {
    console.log(result)
  }
})()
