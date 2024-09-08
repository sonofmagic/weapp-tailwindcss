// import * as url from 'node:url'
import dlv from 'dlv'
import tailwindDefaultConfig from 'tailwindcss/defaultConfig.js'
import nameClass from 'tailwindcss/lib/util/nameClass.js'
import negateValue from 'tailwindcss/lib/util/negateValue.js'
import resolveConfig from 'tailwindcss/resolveConfig.js'

// const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export const defaultConfig = resolveConfig(tailwindDefaultConfig)

export function normalizeProperties(input) {
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

export function getUtilities(plugin, { includeNegativeValues = false } = {}) {
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
    addBase: () => { },
    addDefaults: () => { },
    addComponents: () => { },
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
          const negatedValue = negateValue.default(value)
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
              [nameClass.default(name, modifier)]: declarations,
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
