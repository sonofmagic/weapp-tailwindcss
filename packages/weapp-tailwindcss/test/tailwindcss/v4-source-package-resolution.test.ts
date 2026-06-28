import { afterEach, describe, expect, it, vi } from 'vitest'

describe('tailwind v4 source package css resolution', () => {
  afterEach(() => {
    vi.doUnmock('node:fs')
    vi.doUnmock('node:module')
    vi.resetModules()
  })

  async function loadWithPackageResolver(options: {
    existsSync: (file: string) => boolean
    resolve: (specifier: string) => string
  }) {
    vi.doMock('node:fs', async (importOriginal) => {
      const actual = await importOriginal<typeof import('node:fs')>()
      return {
        ...actual,
        existsSync: vi.fn(options.existsSync),
      }
    })
    vi.doMock('node:module', async (importOriginal) => {
      const actual = await importOriginal<typeof import('node:module')>()
      const projectRequire = Object.assign(vi.fn(), {
        resolve: vi.fn(options.resolve),
      })
      return {
        ...actual,
        createRequire: () => projectRequire,
      }
    })
    return import('@/tailwindcss/v4-engine/source')
  }

  it('rewrites tailwind package css imports through package.json fallback', async () => {
    const { normalizeTailwindV4SourceOptions } = await loadWithPackageResolver({
      existsSync: file => file === '/virtual/tailwindcss/index.css',
      resolve(specifier) {
        if (specifier === 'tailwindcss/index.css') {
          throw new Error('direct entry missing')
        }
        if (specifier === 'tailwindcss/package.json') {
          return '/virtual/tailwindcss/package.json'
        }
        throw new Error(`unexpected ${specifier}`)
      },
    })

    const options = normalizeTailwindV4SourceOptions({
      css: '@import "tailwindcss";',
      packageName: 'tailwindcss',
    })

    expect(options?.css).toContain('/virtual/tailwindcss/index.css')
  })

  it('rewrites tailwind package css imports through engine-adjacent fallback', async () => {
    const { normalizeTailwindV4SourceOptions } = await loadWithPackageResolver({
      existsSync: file => file.endsWith('/tailwindcss/index.css'),
      resolve(specifier) {
        if (specifier === '@tailwindcss-mangle/engine') {
          return '/workspace/node_modules/@tailwindcss-mangle/engine/dist/index.js'
        }
        throw new Error(`missing ${specifier}`)
      },
    })

    const options = normalizeTailwindV4SourceOptions({
      cssSources: [
        {
          file: '/project/src/app.css',
          css: '@reference url("tailwindcss");',
          dependencies: [],
        },
      ],
      packageName: 'tailwindcss',
    })

    expect(options?.cssSources?.[0]?.css).toContain('tailwindcss/index.css')
  })

  it('keeps unresolved custom package imports and malformed css unchanged', async () => {
    const { normalizeTailwindV4SourceOptions } = await loadWithPackageResolver({
      existsSync: () => false,
      resolve() {
        throw new Error('missing')
      },
    })

    const options = normalizeTailwindV4SourceOptions({
      css: '@import "@acme/tailwindcss";\n.card {',
      packageName: '@acme/tailwindcss',
    })

    expect(options?.css).toBe('@import "@acme/tailwindcss";\n.card {')
  })
})
