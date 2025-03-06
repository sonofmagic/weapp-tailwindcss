import { getCompilerContext } from '@/context'
import fs from 'fs-extra'
import path from 'pathe'

function getCase(name: string) {
  return fs.readFileSync(path.resolve(import.meta.dirname, '../fixtures/twMerge', name), 'utf8')
}

const testCases = [
  {
    ignoreCallExpressionIdentifiers: ['twMerge', 'clsx'],
  },
  {
    ignoreCallExpressionIdentifiers: [],
  },
]

describe('twMerge', () => {
  let set: Set<string>
  beforeEach(() => {
    set = new Set()
    set.add('bg-[#434332]')
    set.add('px-[32px]')
    set.add('bg-[#123324]')
    set.add('px-[35px]')
  })
  it.each(testCases)('twMerge case 0.js', async ({ ignoreCallExpressionIdentifiers }) => {
    const testCase = getCase('0.js')
    const { jsHandler } = getCompilerContext(
      {
        ignoreCallExpressionIdentifiers,
      },
    )
    const { code } = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it.each(testCases)('twMerge case 1.js', async ({ ignoreCallExpressionIdentifiers }) => {
    const testCase = getCase('1.js')
    const { jsHandler } = getCompilerContext(
      {
        ignoreCallExpressionIdentifiers,
      },
    )
    const { code } = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it.each(testCases)('twMerge case 2.js', async ({ ignoreCallExpressionIdentifiers }) => {
    const testCase = getCase('2.js')
    const { jsHandler } = getCompilerContext(
      {
        ignoreCallExpressionIdentifiers,
      },
    )
    const { code } = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })

  it.each(testCases)('twMerge case 3.js', async ({ ignoreCallExpressionIdentifiers }) => {
    const testCase = getCase('3.js')
    const { jsHandler } = getCompilerContext(
      {
        ignoreCallExpressionIdentifiers,
      },
    )
    const { code } = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })
})
