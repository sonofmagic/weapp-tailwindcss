import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { parsePublishedPackages, readPublishedPackages, syncPackages } from '../../../../scripts/sync-npmmirror.mjs'

describe('npmmirror 发布同步', () => {
  it('解析并去重 repoctl 发布包列表', () => {
    expect(parsePublishedPackages(JSON.stringify([
      { name: 'tailwindcss-config', version: '2.0.2' },
      { name: '@weapp-tailwindcss/postcss', version: '3.2.3' },
      { name: 'tailwindcss-config', version: '2.0.2' },
    ]))).toEqual(['tailwindcss-config', '@weapp-tailwindcss/postcss'])
  })

  it('优先读取 repoctl 发布包环境变量', async () => {
    await expect(readPublishedPackages({
      publishedPackages: JSON.stringify([
        { name: 'weapp-tailwindcss', version: '5.0.0' },
        { name: '@weapp-tailwindcss/cli', version: '5.0.0' },
      ]),
      summaryPath: path.join(tmpdir(), 'missing-publish-summary.json'),
    })).resolves.toEqual(['weapp-tailwindcss', '@weapp-tailwindcss/cli'])
  })

  it('环境变量缺失时读取 repoctl 发布摘要', async () => {
    const tempRoot = await mkdtemp(path.join(tmpdir(), 'npmmirror-summary-'))
    const summaryPath = path.join(tempRoot, 'pnpm-publish-summary.json')
    try {
      await writeFile(summaryPath, JSON.stringify({
        publishedPackages: [
          { name: 'weapp-tailwindcss', version: '5.0.0' },
          { name: '@weapp-tailwindcss/cli', version: '5.0.0' },
        ],
      }))

      await expect(readPublishedPackages({ publishedPackages: '', summaryPath }))
        .resolves.toEqual(['weapp-tailwindcss', '@weapp-tailwindcss/cli'])
    }
    finally {
      await rm(tempRoot, { force: true, recursive: true })
    }
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
