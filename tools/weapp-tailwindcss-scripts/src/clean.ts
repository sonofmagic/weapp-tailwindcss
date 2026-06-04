// const del = require('del')
import path from 'node:path'
import { greenBright } from 'colorette'

;

(async () => {
  const { deleteAsync: del } = await import('del')
  const deletedDirectoryPaths = await del(['packages/weapp-tailwindcss/dist', 'packages/weapp-tailwindcss/types'], {
    cwd: path.resolve(import.meta.dirname, '../../..'),
  })
  console.log(greenBright('Deleted directories:'))
  console.log(deletedDirectoryPaths.join('\n'))
})()
