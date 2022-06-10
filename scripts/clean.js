const del = require('del')

;(async () => {
  const deletedDirectoryPaths = await del(['dist', 'types'])
  console.log('Deleted directories:\n', deletedDirectoryPaths.join('\n'))
})()
