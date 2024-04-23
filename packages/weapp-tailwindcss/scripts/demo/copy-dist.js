const path = require('node:path')
const fs = require('fs-extra')
const { demoPaths } = require('./constants')

async function main() {
  const root = path.resolve(__dirname, '../../')
  const sourcePath = path.resolve(root, 'demo/web/weapp-tw-dist')

  for (const demoPath of demoPaths) {
    const dest = path.resolve(root, `demo/${demoPath}/weapp-tw-dist`)
    try {
      await fs.ensureDir(dest)
      await fs.copy(sourcePath, dest)
    } catch (error) {
      console.log(error)
    }
  }
}
main()
