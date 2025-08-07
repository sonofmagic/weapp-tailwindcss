import fs from 'fs-extra'
import path from 'pathe'
import { generateCss3, generateCss4 } from '@/index'

const targetWxmlPath = path.resolve(import.meta.dirname, './fixtures/v4/index.wxml')

const targetWxml = await fs.readFile(targetWxmlPath, 'utf8')

describe('tailwindcss', () => {
  describe('3', () => {
    it('should ', async () => {
      expect((await generateCss3(targetWxml)).css).toMatchSnapshot()
    })

    it('should 2', async () => {
      expect((await generateCss3(targetWxml, {
        css: `@tailwind base;@tailwind components;@tailwind utilities;`,
      })).css).toMatchSnapshot()
    })
  })

  describe('4', () => {
    it('should ', async () => {
      expect((await generateCss4(
        path.dirname(targetWxmlPath),
      )).css).toMatchSnapshot()
    })
  })
})
