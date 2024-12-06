import { getDepFiles, processWxml } from '@/wxml'
import fs from 'fs-extra'
import path from 'pathe'

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
    })
  })
})
