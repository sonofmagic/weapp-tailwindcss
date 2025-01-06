/* eslint-disable regexp/no-misleading-capturing-group */
/* eslint-disable regexp/no-super-linear-backtracking */
/* eslint-disable regexp/no-unused-capturing-group */
const arbitraryValueRegex = /^\[(?:([a-z-]+):)?(.+)\]$/i
const fractionRegex = /^\d+\/\d+$/
const stringLengths = new Set(['px', 'full', 'screen'])
const tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/
const lengthUnitRegex
    = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq([whib]|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/
const colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/
// Shadow always begins with x and y offset separated by underscore optionally prepended by inset
const shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/
const imageRegex
    = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/

export function isLength(value: string) {
  return isNumber(value) || stringLengths.has(value) || fractionRegex.test(value)
}

export function isArbitraryLength(value: string) {
  return getIsArbitraryValue(value, 'length', isLengthOnly)
}

export const isNumber = (value: string) => Boolean(value) && !Number.isNaN(Number(value))

export const isArbitraryNumber = (value: string) => getIsArbitraryValue(value, 'number', isNumber)

export const isInteger = (value: string) => Boolean(value) && Number.isInteger(Number(value))

export const isPercent = (value: string) => value.endsWith('%') && isNumber(value.slice(0, -1))

export function isArbitraryValue(value: string) {
  return arbitraryValueRegex.test(value)
}

export function isTshirtSize(value: string) {
  return tshirtUnitRegex.test(value)
}

const sizeLabels = new Set(['length', 'size', 'percentage'])

export const isArbitrarySize = (value: string) => getIsArbitraryValue(value, sizeLabels, isNever)

export function isArbitraryPosition(value: string) {
  return getIsArbitraryValue(value, 'position', isNever)
}

const imageLabels = new Set(['image', 'url'])

export const isArbitraryImage = (value: string) => getIsArbitraryValue(value, imageLabels, isImage)

export const isArbitraryShadow = (value: string) => getIsArbitraryValue(value, '', isShadow)

export const isAny = () => true

function getIsArbitraryValue(value: string, label: string | Set<string>, testValue: (value: string) => boolean) {
  const result = arbitraryValueRegex.exec(value)

  if (result) {
    if (result[1]) {
      return typeof label === 'string' ? result[1] === label : label.has(result[1])
    }

    return testValue(result[2]!)
  }

  return false
}

function isLengthOnly(value: string) {
  return lengthUnitRegex.test(value) && !colorFunctionRegex.test(value)
}

const isNever = () => false

const isShadow = (value: string) => shadowRegex.test(value)

const isImage = (value: string) => imageRegex.test(value)
