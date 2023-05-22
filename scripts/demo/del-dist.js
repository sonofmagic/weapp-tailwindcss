const path = require('node:path')
const del = require('del')
const { demoPaths } = require('./constants')

async function main() {
  const root = path.resolve(__dirname, '../../')
  const sourcePath = path.resolve(root, 'demo/web/weapp-tw-dist')
  let dirCount = 0
  for (const demoPath of demoPaths) {
    const res = await del(path.resolve(root, `demo/${demoPath}/weapp-tw-dist`), {
      force: true
    })
    res.length > 0 && dirCount++
  }
  const res = await del(sourcePath)
  res.length > 0 && dirCount++
  console.log(`[dirCount]:${dirCount}`)
}
main()
