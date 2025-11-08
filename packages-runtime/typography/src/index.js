const castArray = require('lodash.castarray')
const merge = require('lodash.merge')
const parser = require('postcss-selector-parser')
const plugin = require('tailwindcss/plugin')
const styles = require('./styles')
const { commonTrailingPseudos } = require('./utils')

const parseSelector = parser()
const computed = {
  // Reserved for future "magic properties", for example:
  // bulletColor: (color) => ({ 'ul > li::before': { backgroundColor: color } }),
}

function inWhere(selector, { className, modifier, prefix }) {
  const prefixedNot = prefix(`.not-${className}`).slice(1)
  const selectorPrefix = selector.startsWith('>') ? `${modifier === 'DEFAULT' ? `.${className}` : `.${className}-${modifier}`} ` : ''

  // Parse the selector, if every component ends in the same pseudo element(s) then move it to the end
  const [trailingPseudo, rebuiltSelector] = commonTrailingPseudos(selector)

  if (trailingPseudo) {
    return `:where(${selectorPrefix}${rebuiltSelector}):not(:where([class~="${prefixedNot}"],[class~="${prefixedNot}"] *))${trailingPseudo}`
  }

  return `:where(${selectorPrefix}${selector}):not(:where([class~="${prefixedNot}"],[class~="${prefixedNot}"] *))`
}

function isObject(value) {
  return typeof value === 'object' && value !== null
}

function transformTag2Class(s, classPrefix = '') {
  const ast = parseSelector.astSync(s)
  ast.walkTags((tag) => {
    tag.replaceWith(
      parser.className({
        value: classPrefix + tag.value,
      }),
    )
  })
  return ast.toString()
}

function configToCss(config = {}, { target, className, modifier, prefix, mode, classPrefix }) {
  function updateSelector(k, v) {
    if (target === 'legacy') {
      return mode === 'class' && typeof v === 'object' ? [transformTag2Class(k, classPrefix), v] : [k, v]
    }

    if (Array.isArray(v)) {
      return [k, v]
    }

    if (isObject(v)) {
      const nested = Object.values(v).some(element => isObject(element))
      if (nested) {
        return [inWhere(k, { className, modifier, prefix }), v, Object.fromEntries(Object.entries(v).map(([k, v]) => updateSelector(k, v)))]
      }

      return [inWhere(k, { className, modifier, prefix }), v]
    }

    return [k, v]
  }

  return Object.fromEntries(
    Object.entries(
      merge(
        {},
        ...Object.keys(config)
          .filter(key => computed[key])
          .map(key => computed[key](config[key])),
        ...castArray(config.css || {}),
      ),
    ).map(([k, v]) => updateSelector(k, v)),
  )
}

const typographyPlugin = plugin.withOptions(
  ({ className = 'prose', target = 'legacy', mode = 'class', classPrefix = '' } = {}) => {
    // legacy | modern
    return function ({ addVariant, addComponents, theme, prefix }) {
      const modifiers = theme('typography')

      const options = { className, prefix }

      for (let [name, ...selectors] of [
        ['headings', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'th'],
        ['h1'],
        ['h2'],
        ['h3'],
        ['h4'],
        ['h5'],
        ['h6'],
        ['p'],
        ['a'],
        ['blockquote'],
        ['figure'],
        ['figcaption'],
        ['strong'],
        ['em'],
        ['code'],
        ['pre'],
        ['ol'],
        ['ul'],
        ['li'],
        ['table'],
        ['thead'],
        ['tr'],
        ['th'],
        ['td'],
        ['img'],
        ['video'],
        ['hr'],
        ['lead', '[class~="lead"]'],
      ]) {
        selectors = selectors.length === 0 ? [name] : selectors
        const isClassMode = mode === 'class'
        const selector = target === 'legacy' ? selectors.map(selector => `& ${isClassMode ? transformTag2Class(selector, classPrefix) : selector}`) : selectors.join(', ')

        addVariant(`${className}-${name}`, target === 'legacy' ? selector : `& :is(${inWhere(selector, options)})`)
      }

      addComponents(
        Object.keys(modifiers).map(modifier => ({
          [modifier === 'DEFAULT' ? `.${className}` : `.${className}-${modifier}`]: configToCss(modifiers[modifier], {
            target,
            className,
            modifier,
            prefix,
            mode,
            classPrefix,
          }),
        })),
      )
    }
  },
  () => {
    return {
      theme: { typography: styles },
    }
  },
)

module.exports = typographyPlugin
