const del = require('del')
const chalk = require('chalk')
;(async () => {
  const deletedDirectoryPaths = await del(['dist', 'types'])
  console.log(chalk.green.bold('Deleted directories:'))
  console.log(deletedDirectoryPaths.join('\n'))
})()
