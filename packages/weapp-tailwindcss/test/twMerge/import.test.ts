import { getCompilerContext } from '@/context'
import { parseCache } from '@/js/babel'
import fs from 'fs-extra'
import path from 'pathe'

function getCase(name: string) {
  return fs.readFileSync(path.resolve(import.meta.dirname, '../fixtures/twMerge', name), 'utf8')
}

const testCases = [
  {
    ignoreCallExpressionIdentifiers: ['clsx'],
  },
  {
    ignoreCallExpressionIdentifiers: [],
  },
]

describe('twMerge import', () => {
  let set: Set<string>
  beforeEach(() => {
    parseCache.clear()
    set = new Set()
    set.add('px-[35px]')
  })
  it.each(testCases)('twMerge case 0.js', async ({ ignoreCallExpressionIdentifiers }) => {
    const testCase = getCase('import/a.js')
    const { jsHandler } = getCompilerContext(
      {
        ignoreCallExpressionIdentifiers,
      },
    )
    const { code } = await jsHandler(testCase, set)
    expect(code).toMatchSnapshot()
  })
})
