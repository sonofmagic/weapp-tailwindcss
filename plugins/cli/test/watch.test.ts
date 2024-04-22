import path from 'node:path'
import { fixturesPath } from './utils'
import { watch } from '@/build'
// import { createWatcher } from '@/watch'
// const stubGetWatchedCode = /getWatched\(\) {.+?return {};.+?}/s

describe('watch', () => {
  it('native watch', () => {
    const nativePath = path.resolve(fixturesPath, 'native')
    const { globsSet } = watch({
      root: nativePath
    })
    expect(globsSet).toMatchSnapshot()
    // gulp
    //   .src(['./**/*.{js,ts}', '!./dist/**/*'], {
    //     cwd: path.resolve(fixturesPath, 'native')
    //   })
    //   .pipe(gulp.dest('dist'))
    // const watcher = createWatcher({
    //   paths: path.resolve(fixturesPath, 'native')
    // })
    // const watchedArray = watcher.getWatched()
    // console.log(watchedArray)
    // expect(watcher.getWatched.toString()).not.toMatch(stubGetWatchedCode)
  })

  // it('native-ts watch', () => {})
})
