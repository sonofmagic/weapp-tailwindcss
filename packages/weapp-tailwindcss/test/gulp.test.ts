import type internal from 'node:stream'
import path from 'node:path'
import { gulpCasePath } from '#test/util'
import gulp from 'gulp'
import postcss from 'gulp-postcss'
import { createPlugins } from '@/gulp'

function promisify(task: internal.Transform) {
  return new Promise((resolve, reject) => {
    if (task.destroyed) {
      resolve(undefined)
      return
    }
    task.on('finish', resolve).on('error', reject)
  })
}

function readContent(task: internal.Transform) {
  return new Promise((resolve, reject) => {
    task
      .on('data', (file) => {
        const result = file.contents.toString('utf8')
        resolve(result)
      })
      .on('error', reject)
  })
}

async function matchSnap(plugins: ReturnType<typeof createPlugins>) {
  const { transformJs, transformWxml, transformWxss } = plugins
  // const cssPath = path.resolve(gulpCasePath, '*.css')

  const cssTask = gulp
    .src('./src/**/*.css', {
      cwd: gulpCasePath,
    })
    .pipe(
      postcss([
        require('tailwindcss')({
          config: path.resolve(gulpCasePath, 'tailwind.config.js'),
        }),
      ]),
    )
    .pipe(transformWxss())

  const result = await readContent(cssTask)
  expect(result).toMatchSnapshot('css')
  await promisify(cssTask)

  const jsTask = gulp
    .src('./src/**/*.js', {
      cwd: gulpCasePath,
    })
    .pipe(transformJs())

  const wxmlTask = gulp
    .src('./src/**/*.wxml', {
      cwd: gulpCasePath,
    })
    .pipe(transformWxml())

  const ptasks = [jsTask, wxmlTask]
  const [jsRes, wxmlRes] = await Promise.all(ptasks.map(element => readContent(element)))
  expect(jsRes).toMatchSnapshot('js')
  expect(wxmlRes).toMatchSnapshot('wxml')
  await Promise.all(ptasks.map(element => promisify(element)))
}
describe('gulp', () => {
  it('common build', async () => {
    await matchSnap(createPlugins())
  })
})
