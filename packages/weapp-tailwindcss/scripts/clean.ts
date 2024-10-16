// const del = require('del')
import { greenBright } from 'colorette'

;

(async () => {
  const { deleteAsync: del } = await import('del')
  const deletedDirectoryPaths = await del(['dist', 'types'])
  console.log(greenBright('Deleted directories:'))
  console.log(deletedDirectoryPaths.join('\n'))
})()
