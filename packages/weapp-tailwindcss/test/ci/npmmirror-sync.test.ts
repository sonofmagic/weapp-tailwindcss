import { describe, expect, it } from 'vitest'
import { parsePublishedPackages, syncPackages } from '../../../../scripts/sync-npmmirror.mjs'

describe('npmmirror 发布同步', () => {
  it('解析并去重 Changesets 发布包列表', () => {
    expect(parsePublishedPackages(JSON.stringify([
      { name: 'tailwindcss-config', version: '2.0.2' },
      { name: '@weapp-tailwindcss/postcss', version: '3.2.3' },
      { name: 'tailwindcss-config', version: '2.0.2' },
    ]))).toEqual(['tailwindcss-config', '@weapp-tailwindcss/postcss'])
  })

  it('为 scoped 和 unscoped 包创建同步请求', async () => {
    const requests = []
    await syncPackages(['tailwindcss-config', '@weapp-tailwindcss/postcss'], {
      registry: 'https://mirror.test',
      fetchImpl: async (url, init) => {
        requests.push({ url, init })
        return new Response(JSON.stringify({ ok: true, id: 'sync-1' }), { status: 201 })
      },
    })

    expect(requests).toEqual([
      { url: 'https://mirror.test/-/package/tailwindcss-config/syncs', init: { method: 'PUT' } },
      { url: 'https://mirror.test/-/package/%40weapp-tailwindcss/postcss/syncs', init: { method: 'PUT' } },
    ])
  })
})
