import { extendTailwindMerge, twMerge } from 'tailwind-merge'
import { expect } from 'vitest'
import { defaultConfig } from '../src/index'

defaultConfig.twMergeAdapter = { extendTailwindMerge, twMerge }

function parseClasses(result: string | string[]) {
  return (typeof result === 'string' ? result.split(' ') : result).slice().sort()
}

expect.extend({
  toHaveClass(received, expected) {
    const normalizedExpected = parseClasses(expected)
    const normalizedReceived = parseClasses(received)

    return {
      pass:
        this.equals(normalizedExpected, normalizedReceived)
        && normalizedExpected.length === normalizedReceived.length,
      message: () => {
        return (
          `${this.utils.matcherHint(
            `${this.isNot ? '.not' : ''}.toHaveClass`,
            'element',
            this.utils.printExpected(normalizedExpected.join(' ')),
          )
          }\n\n${
            this.utils.printDiffOrStringify(
              normalizedExpected,
              normalizedReceived,
            )}`
        )
      },
    }
  },
})

declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveClass: (expected: string | string[]) => T
  }

  interface AsymmetricMatchersContaining {
    toHaveClass: (expected: string | string[]) => void
  }
}
