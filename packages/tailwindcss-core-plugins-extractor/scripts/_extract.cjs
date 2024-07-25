const fs = require('fs-extra')
const dlv = require('lodash').get
const defaultConfig = require('tailwindcss/resolveConfig')(
  require('tailwindcss/defaultConfig'),
)
const screens = require('tailwindcss/defaultTheme').screens
const corePlugins = require('tailwindcss/lib/corePlugins.js').corePlugins

const keys = Object.keys(corePlugins)
// https://github.com/tailwindlabs/tailwindcss.com
// next.config.js
function normalizeProperties(input) {
  if (typeof input !== 'object') {
    return input
  }
  if (Array.isArray(input)) {
    return input.map(normalizeProperties)
  }
  return Object.keys(input).reduce((newObj, key) => {
    const val = input[key]
    const newVal = typeof val === 'object' ? normalizeProperties(val) : val
    newObj[key.replace(/([a-z])([A-Z])/g, (_m, p1, p2) => `${p1}-${p2.toLowerCase()}`)] = newVal
    return newObj
  }, {})
}

function getUtilities(plugin, { includeNegativeValues = false } = {}) {
  if (!plugin) {
    return {}
  }
  const utilities = {}

  function addUtilities(utils) {
    utils = Array.isArray(utils) ? utils : [utils]
    for (let i = 0; i < utils.length; i++) {
      for (const prop in utils[i]) {
        for (const p in utils[i][prop]) {
          if (p.startsWith('@defaults')) {
            delete utils[i][prop][p]
          }
        }
        utilities[prop] = normalizeProperties(utils[i][prop])
      }
    }
  }

  plugin({
    addBase: () => {},
    addDefaults: () => {},
    addComponents: () => {},
    corePlugins: () => true,
    prefix: x => x,
    config: (option, defaultValue) => (option ? defaultValue : { future: {} }),
    addUtilities,
    theme: (key, defaultValue) => dlv(defaultConfig.theme, key, defaultValue),
    matchUtilities: (matches, { values, supportsNegativeValues } = {}) => {
      if (!values) {
        return
      }

      const modifierValues = Object.entries(values)

      if (includeNegativeValues && supportsNegativeValues) {
        const negativeValues = []
        for (const [key, value] of modifierValues) {
          const negatedValue = require('tailwindcss/lib/util/negateValue').default(value)
          if (negatedValue) {
            negativeValues.push([`-${key}`, negatedValue])
          }
        }
        modifierValues.push(...negativeValues)
      }

      const result = Object.entries(matches).flatMap(([name, utilityFunction]) => {
        return modifierValues
          .map(([modifier, value]) => {
            const declarations = utilityFunction(value, {
              includeRules(rules) {
                addUtilities(rules)
              },
            })

            if (!declarations) {
              return null
            }

            return {
              [require('tailwindcss/lib/util/nameClass').default(name, modifier)]: declarations,
            }
          })
          .filter(Boolean)
      })

      for (const obj of result) {
        for (const key in obj) {
          let deleteKey = false
          for (const subkey in obj[key]) {
            if (subkey.startsWith('@defaults')) {
              delete obj[key][subkey]
              continue
            }
            if (subkey.includes('&')) {
              result.push({
                [subkey.replace(/&/g, key)]: obj[key][subkey],
              })
              deleteKey = true
            }
          }

          if (deleteKey) {
            delete obj[key]
          }
        }
      }

      addUtilities(result)
    },
  })
  return utilities
}

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
