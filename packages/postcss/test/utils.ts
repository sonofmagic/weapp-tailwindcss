import fs from 'fs-extra'
import path from 'pathe'
import postcss from 'postcss'

export async function generateCss(base: string, css: string = '@import "weapp-tailwindcss";') {
  const tailwindcss = (await import('@tailwindcss/postcss')).default
  return await postcss([
    tailwindcss({
      base,
    }),
  ])
    .process(css, {
      from: 'style.css',
    })
}

export function getFixture(...paths: string[]) {
  return fs.readFile(path.resolve(__dirname, './fixtures', ...paths), 'utf8')
}
