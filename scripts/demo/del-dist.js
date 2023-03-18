const del = require('del')
const path = require('path')
const { demoPaths } = require('./constants')

async function main() {
  const root = path.resolve(__dirname, '../../')
  const sourcePath = path.resolve(root, 'demo/web/weapp-tw-dist')
  let dirCount = 0
  for (let i = 0; i < demoPaths.length; i++) {
    const demoPath = demoPaths[i]
    const res = await del(path.resolve(root, `demo/${demoPath}/weapp-tw-dist`))
    res.length && dirCount++
  }
  const res = await del(sourcePath)
  res.length && dirCount++
  console.log(`[dirCount]:${dirCount}`)
}
main()
