const { Buffer } = require('node:buffer')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const process = require('node:process')

async function main() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'output-copy-race-'))
  const source = path.join(directory, 'bundle.js')
  const destination = path.join(directory, 'evidence.js')
  const errors = []
  let attempts = 0
  try {
    await fs.writeFile(source, Buffer.alloc(32 * 1024 * 1024, 65))
    for (let round = 0; round < 10; round++) {
      const state = { copying: true }
      const copy = fs.copyFile(source, destination)
        .catch(error => errors.push({ operation: 'copy', code: error.code }))
        .finally(() => { state.copying = false })
      while (state.copying) {
        attempts++
        let file
        try {
          file = await fs.open(source, 'r+')
          await file.write(Buffer.from('A'), 0, 1, 0)
        }
        catch (error) { errors.push({ operation: 'write', code: error.code }) }
        finally { await file?.close() }
      }
      await copy
    }
    console.log(JSON.stringify({ platform: process.platform, attempts, errors }))
  }
  finally { await fs.rm(directory, { recursive: true, force: true }) }
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
