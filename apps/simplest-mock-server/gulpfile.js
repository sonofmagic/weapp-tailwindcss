const path = require('node:path')
const process = require('node:process')
const gulp = require('gulp')
const nodemon = require('gulp-nodemon')
const minimist = require('minimist')

const args = minimist(process.argv.slice(2), {
  string: ['dir'],
  number: ['port'],
  default: { dir: 'example', port: 3000 },
})

const api = path.resolve(__dirname, args.dir)

gulp.task('mock', () => {
  const stream = nodemon({
    script: './server.js',
    // 监听文件的后缀
    ext: 'js json',
    args: ['--dir', args.dir, '--port', args.port],
    env: {
      NODE_ENV: 'development',
    },
    // 监听的路径
    watch: [api, './server.js', './router.js'],
  })
  stream.on('crash', () => {
    console.error('application has crashed!\n')
    stream.emit('restart', 10)
  })
})
