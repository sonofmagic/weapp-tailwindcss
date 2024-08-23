import path from 'pathe'
import { omit } from 'lodash'
import { CompilerContext } from '@/context'

const fixturesDir = path.resolve(__dirname, '../fixtures')

function getFixture(dir: string) {
  return path.resolve(fixturesDir, dir)
}

describe('build', () => {
  it('compilerContext', async () => {
    const ctx = new CompilerContext({
      cwd: getFixture('mixjs'),
    })
    expect(omit(ctx, 'cwd')).matchSnapshot()
    await ctx.loadDefaultConfig()
    expect(omit(ctx, 'cwd')).matchSnapshot()
    await ctx.build()
  })
})
