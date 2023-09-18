import { createCache } from '@/cache'

describe('cache', () => {
  let ctx: ReturnType<typeof createCache>
  beforeEach(() => {
    ctx = createCache()
  })

  it('toBeDefined', () => {
    expect(ctx).toBeDefined()
    expect(ctx.calcHashValueChanged).toBeDefined()
    expect(ctx.computeHash).toBeDefined()
    expect(ctx.get).toBeDefined()
    expect(ctx.getHashValue).toBeDefined()
    expect(ctx.has).toBeDefined()
    expect(ctx.hasHashKey).toBeDefined()
    expect(ctx.hashMap).toBeDefined()
    expect(ctx.instance).toBeDefined()
    expect(ctx.process).toBeDefined()
    expect(ctx.set).toBeDefined()
    expect(ctx.setHashValue).toBeDefined()
  })
})
