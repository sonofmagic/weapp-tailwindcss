import { generateCss4 as generateCss } from '@weapp-tailwindcss/test-helper'
import fs from 'fs-extra'
import path from 'pathe'

export {
  generateCss,
}

export function getFixture(...paths: string[]) {
  return fs.readFile(path.resolve(__dirname, './fixtures', ...paths), 'utf8')
}
