import gulp from 'gulp'
import postcss from 'gulp-postcss'
import { createPlugins } from '@/gulp'
import path from 'path'

describe('gulp', () => {
  it('common build', () => {
    const { transformJs, transformWxml, transformWxss } = createPlugins()
  })
})
