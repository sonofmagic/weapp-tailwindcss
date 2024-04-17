import path from 'node:path'
import fs from 'fs-extra'
import { fixturesPath } from './utils'
import { createWatcher } from '@/watch'
const stubGetWatchedCode = /getWatched\(\) {.+?return {};.+?}/s

describe('watch', () => {
  it('native watch', () => {
    const watcher = createWatcher({
      paths: path.resolve(fixturesPath, 'native')
    })

    const watchedArray = watcher.getWatched()
    console.log(watchedArray)
    expect(watcher.getWatched.toString()).not.toMatch(stubGetWatchedCode)
  })

  it('native-ts watch', () => {})
})
