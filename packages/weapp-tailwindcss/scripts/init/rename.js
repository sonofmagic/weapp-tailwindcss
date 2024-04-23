const fs = require('node:fs')
const fsp = fs.promises
const path = require('node:path')
const pkg = require('../../package.json')

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
      pkg[paths[0]] = pkg[paths[0]].replaceAll('npm-lib-template', name)
      break
    }
    case 2: {
      pkg[paths[0]][paths[1]] = pkg[paths[0]][paths[1]].replaceAll('npm-lib-template', name)
      break
    }
  }
}

function replacePkg (name) {
  for (const p of ['name', 'description', 'bugs.url', 'repository.url', 'homepage']) {
    doReplace(p, name)
    console.log(`[${p}] replace over`)
  }
  return pkg
}

 (async () => {
  const cwd = process.cwd()
  const dirname = path.basename(cwd)
  const pkg = replacePkg(dirname)
  await fsp.writeFile('./package.json', JSON.stringify(pkg, null, 2))
  console.log('rename successfully!')
})()
