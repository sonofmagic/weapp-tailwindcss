const path = require('path')
const { eachDir } = require('@icebreakers/cli')
const del = require('del')

;(async () => {
  const demoPath = path.resolve(__dirname, '../../demo')
  eachDir(demoPath, async (basename, pathLike) => {
    const deletedDirectoryPaths = await del([path.resolve(pathLike, 'node_modules')], {
      onProgress: (progress) => {
        console.log(progress.percent)
      }
    })
    console.log(deletedDirectoryPaths)
  })
})()
