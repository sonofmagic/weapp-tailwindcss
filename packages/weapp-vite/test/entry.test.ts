import { getEntries } from '@/entry'
import { absDirs } from './utils'

describe('entry', () => {
  // function normalizeScanEntries(result: Awaited<ReturnType<typeof scanEntries>>) {
  //   return {
  //     app: path.normalize(result?.app ?? ''),
  //     pages: [...result?.pages ?? []].map(x => path.normalize(x)),
  //     components: [...result?.components ?? []].map(x => path.normalize(x)),
  //     // css: result?.css.map(x => path.normalize(x)),
  //   }
  // }
  describe('scanEntries', () => {
    it.each(absDirs)('$name', async ({ path: root }) => {
      // expect(normalizeScanEntries()).toMatchSnapshot()
      const entries = await getEntries({
        root,
        relative: true,
      })
      expect(entries).toMatchSnapshot()
    })
  })
})
