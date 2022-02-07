import { getClassCandidates } from '../src/expandTailwindAtRules'
import { defaultExtractor } from '../src/defaultExtractor'
// @ts-ignore
import { jsxCasePath, readFile, resolve } from './util'

function getCase (casename: string) {
  return readFile(resolve(jsxCasePath, casename))
}
describe('Name of the group', () => {
  test('should ', async () => {
    const candidates = new Set(['*'])
    const seen = new Set<string>()
    const testCase = await getCase('case2.js')
    getClassCandidates(testCase, defaultExtractor, candidates, seen)
    expect(candidates.size).toBe(36) // .toBe()
    expect(seen.size).toBe(6)
  })
})
