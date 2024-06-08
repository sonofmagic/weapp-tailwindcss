import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { run } from './run.js'

const getFilename = () => fileURLToPath(import.meta.url)
const getDirname = () => path.dirname(getFilename())
const __dirname = /* @__PURE__ */ getDirname()
const argvs = process.argv.slice(2)
const useBabel = argvs.includes('--babel')

  ; (async () => {
  const demoPath = path.resolve(__dirname, '../../demo')
  const result = []
  try {
    await run(demoPath, `build${useBabel ? ':babel' : ''}`)
  }
  catch (error) {
    result.push(error)
  }
  if (result.length > 0) {
    console.log(result)
  }
})()
