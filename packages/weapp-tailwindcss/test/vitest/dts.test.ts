import fs from 'node:fs'
// import path from 'node:path'
import klaw from 'klaw'
import { distPath } from '#test/util'

describe.skip('dts', () => {
  it('dist dts no `from "@/xxx`', async () => {
    for await (const file of klaw(distPath)) {
      if (/\.d.ts$/.test(file.path)) {
        // console.log(file.path)
        const content = fs.readFileSync(file.path, 'utf8')
        // expect(content).not.toContain('from "@/')
        // expect(content).not.toContain("from '@/")
        // expect(content).not.toMatch(/from\s+["']@\//g)
        expect(content).toEqual(expect.not.stringMatching(/from\s+["']@\//g))
      }
    }
  })
})
