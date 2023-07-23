const del = require('del')
const { greenBright } = require('colorette')
;(async () => {
  const deletedDirectoryPaths = await del(['dist', 'types'])
  console.log(greenBright('Deleted directories:'))
  console.log(deletedDirectoryPaths.join('\n'))
})()
