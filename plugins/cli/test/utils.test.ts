// import gulpif from 'gulp-if'
import { isDuplexStream, isStream, isTransformStream } from '@/is-stream'
import less from 'gulp-less'
import postcssrc from 'gulp-postcss'
// import createSass from 'gulp-sass'
import rename from 'gulp-rename'
import typescript from 'gulp-typescript'
import { createPlugins } from 'weapp-tailwindcss/gulp'

describe('utils', () => {
  describe('is stream', () => {
    it('should be stream', () => {
      const { transformJs, transformWxml, transformWxss } = createPlugins()
      expect(isStream(transformJs())).toBe(true)
      expect(isStream(transformWxml())).toBe(true)
      expect(isStream(transformWxss())).toBe(true)

      expect(isStream(postcssrc())).toBe(true)
      // expect(isStream(postcssrc())).toBe(true)
      expect(isStream(rename({}))).toBe(true)
      expect(isStream(less())).toBe(true)
      expect(isStream(typescript())).toBe(true)
    })

    it('should be TransformStream', () => {
      const { transformJs, transformWxml, transformWxss } = createPlugins()
      expect(isTransformStream(transformJs())).toBe(true)
      expect(isTransformStream(transformWxml())).toBe(true)
      expect(isTransformStream(transformWxss())).toBe(true)

      expect(isTransformStream(postcssrc())).toBe(true)
      // expect(isTransformStream(gulpif(true, postcssrc()))).toBe(true)
      expect(isTransformStream(rename({}))).toBe(true)
      // expect(isTransformStream(less())).toBe(true)
      // expect(isTransformStream(typescript())).toBe(true)
    })

    it('should be isDuplexStream', () => {
      const { transformJs, transformWxml, transformWxss } = createPlugins()
      expect(isDuplexStream(transformJs())).toBe(true)
      expect(isDuplexStream(transformWxml())).toBe(true)
      expect(isDuplexStream(transformWxss())).toBe(true)

      expect(isDuplexStream(postcssrc())).toBe(true)
      // expect(isDuplexStream(gulpif(true, postcssrc()))).toBe(true)
      expect(isDuplexStream(rename({}))).toBe(true)
      // expect(isDuplexStream(less())).toBe(true)
      expect(isDuplexStream(typescript())).toBe(true)
    })
  })
})
