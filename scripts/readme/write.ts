import fs from 'fs-extra'
import path from 'pathe'

function r(...args: string[]) {
  return path.resolve(import.meta.dirname, ...args)
}

const md = await fs.readFile(r('./T.md'))

for (const p of [
  '../../README.md',
  ...([
    'init',
    'logger',
    'mangle',
    'merge',
    'postcss',
    'shared',
    'weapp-tailwindcss',
  ].map((x) => {
    return `../../packages/${x}/README.md`
  })),
]) {
  await fs.writeFile(r(p), md)
}
