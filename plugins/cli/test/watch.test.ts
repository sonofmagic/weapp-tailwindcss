import path from 'node:path'
import fs from 'fs-extra'
import gulp from 'gulp'
import { fixturesPath } from './utils'
// import { createWatcher } from '@/watch'
// const stubGetWatchedCode = /getWatched\(\) {.+?return {};.+?}/s

describe('watch', () => {
  it('native watch', () => {
    gulp
      .src(['./**/*.{js,ts}', '!./dist/**/*'], {
        cwd: path.resolve(fixturesPath, 'native')
      })
      .pipe(gulp.dest('dist'))
    // const watcher = createWatcher({
    //   paths: path.resolve(fixturesPath, 'native')
    // })
    // const watchedArray = watcher.getWatched()
    // console.log(watchedArray)
    // expect(watcher.getWatched.toString()).not.toMatch(stubGetWatchedCode)
  })

  it('native-ts watch', () => {})
})
