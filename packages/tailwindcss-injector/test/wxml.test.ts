import fs from 'fs-extra'
import path from 'pathe'
import { getDepFiles, processWxml } from '@/wxml'

const fixturesDir = path.resolve(
  import.meta.dirname,
  './fixtures',
)

describe('wxml', () => {
  describe('processWxml', () => {
    it('process case 0', async () => {
      const deps = await processWxml(
        await fs.readFile(
          path.resolve(
            fixturesDir,
            'wxml/index.wxml',
          ),
        ),
      )

      expect(deps).toMatchSnapshot()
    })

    it('process case 1', async () => {
      const deps = await processWxml(
        await fs.readFile(
          path.resolve(
            import.meta.dirname,
            './fixtures/wxml/header.wxml',
          ),
        ),
      )
      expect(deps).toMatchSnapshot()
    })
  })
  describe('getDepFiles', () => {
    it('case 0', async () => {
      const files = await getDepFiles(path.resolve(
        fixturesDir,
        'wxml/index.wxml',
      ))
      expect([...files].map((x) => {
        return path.relative(
          path.resolve(__dirname, '..'),
          x,
        )
      })).matchSnapshot()
      const { depsMap, hashMap } = await import('@/wxml')
      expect(hashMap.size).toBe(7)
      expect(depsMap.size).toBe(7)

      // expect(hashMap).toMatchSnapshot()
      // expect(depsMap).toMatchSnapshot()
    })
  })
})
