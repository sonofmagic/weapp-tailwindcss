import fs from 'fs-extra'
import path from 'pathe'

const md = await fs.readFile(path.resolve(import.meta.dirname, './T.md'))

await fs.writeFile(path.resolve(import.meta.dirname, '../../README.md'), md)
