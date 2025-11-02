/* eslint-disable ts/no-require-imports */
const fs = require('node:fs')
const path = require('node:path')

function main() {
  const targetPath = path.resolve(__dirname, '../dist/postinstall.cjs')
  if (fs.existsSync(targetPath)) {
    require(targetPath)
  }
  else {
    console.log('postinstall.cjs not found')
  }
}

main()
