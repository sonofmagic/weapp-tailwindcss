const path = require('node:path')
const stream = require('node:stream')
const chokidar = require('chokidar')
const gulp = require('gulp')

function promisify(task) {
  return new Promise((resolve, reject) => {
    if (task.destroyed) {
      resolve(undefined)
      return
    }
    task.on('finish', resolve).on('error', reject)
  })
}

async function main() {
  const nativePath = path.resolve(__dirname, '../fixtures/native')
  const transform = new stream.Transform({
    objectMode: true,
    transform(chunk, encoding, cb) {
      cb(null, chunk)
    },
  })

  // chokidar
  //   .watch(path.resolve(__dirname, '../fixtures/native'), {
  //     ignored: ['**/node_modules/**', /(^|[/\\])\../, '**/dist/**', '**/miniprogram_npm/**']
  //   })
  //   .on('all', (event, path) => {
  //     console.log(event, path)
  //   })

  await promisify(
    gulp
      .src(
        ['**/*.{js,ts,json,css,wxss,wxml}', '!dist/**/*', '!**/node_modules/**', '!**/miniprogram_npm/**'], // '!node_modules/**/*', '!miniprogram_npm/**/*'],

        {
          cwd: nativePath,
        },
      )
      .pipe(
        gulp.dest('dist', {
          cwd: nativePath,
        }),
      ),
  )
  console.log('-----------')
}

main()
