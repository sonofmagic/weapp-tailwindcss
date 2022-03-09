const execa = require('execa')
const path = require('path')
const fs = require('fs').promises
const demoPath = path.resolve(__dirname, '../../demo')
  ; (async () => {
  const filenames = await fs.readdir(demoPath)
  for (let i = 0; i < filenames.length; i++) {
    const filename = filenames[i]
    const p = path.resolve(demoPath, filename)
    const stat = await fs.stat(p)
    if (stat.isDirectory()) {
      process.chdir(p)
      await execa('yarn').stdout.pipe(process.stdout)
      await execa('yarn add -D weapp-tailwindcss-webpack-plugin').stdout.pipe(process.stdout)
    }
  }
})()
