import fs from 'fs-extra'
import _corePlugins from 'tailwindcss/lib/corePlugins.js'
import defaultTheme from 'tailwindcss/defaultTheme.js'
import { getUtilities } from './extract.js'

const { screens } = defaultTheme
const { corePlugins } = _corePlugins
const keys = Object.keys(corePlugins)

function JSONStringify(data) {
  return JSON.stringify(data, null, 2)
}

async function main() {
  const result = []
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const plugin = corePlugins[key]
    const str = `export default ${JSONStringify(getUtilities(plugin))}`
    await fs.writeFile(`./src/corePlugins/${key}.ts`, str, {
      encoding: 'utf-8',
    })
    result.push(`import ${key} from './corePlugins/${key}'`)
  }

  const str = `export default ${JSONStringify(screens)}`
  await fs.writeFile('./src/theme/screens.ts', str, {
    encoding: 'utf-8',
  })
  result.push('import screens from \'./theme/screens\'')
  keys.push('screens')
  result.push(`export { ${keys.join(',')} }`)
  const exportCode = result.join('\n')
  await fs.writeFile('./src/index.ts', exportCode, {
    encoding: 'utf8',
  })
}

main()
