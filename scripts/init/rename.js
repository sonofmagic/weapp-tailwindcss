const fs = require('fs')
const fsp = fs.promises
const pkg = require('../../package.json')
const path = require('path')

/**
 * 临时解决方案
 * @param {String} ref
 * @param {String} name
 */
function doReplace (ref, name) {
  const paths = ref.split('.')
  const len = paths.length
  switch (len) {
    case 1: {
      pkg[paths[0]] = pkg[paths[0]].replace(/npm-lib-template/g, name)
      break
    }
    case 2: {
      pkg[paths[0]][paths[1]] = pkg[paths[0]][paths[1]].replace(/npm-lib-template/g, name)
      break
    }
  }
}

function replacePkg (name) {
  ['name', 'description', 'bugs.url', 'repository.url', 'homepage'].forEach(p => {
    doReplace(p, name)
    console.log(`[${p}] replace over`)
  })
  return pkg
}

; (async () => {
  const cwd = process.cwd()
  const dirname = path.basename(cwd)
  const pkg = replacePkg(dirname)
  await fsp.writeFile('./package.json', JSON.stringify(pkg, null, 2))
  console.log('rename successfully!')
})()
