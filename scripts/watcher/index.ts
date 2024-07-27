import chokidar from 'chokidar'

// One-liner for current directory
chokidar.watch('./e2e').on('all', (event, path) => {
  console.log(event, path)
})
