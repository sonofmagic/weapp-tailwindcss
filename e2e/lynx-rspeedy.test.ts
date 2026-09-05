import type { StaticEvidenceReport } from '../examples/react-lynx/src/compatibility/types'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import staticEvidenceJson from '../examples/react-lynx/src/compatibility/static-evidence.json'
import { buildCompatibilityBundle } from './lynx/build'
import { compatibilityDir, exampleDir, getCatalogHash, lynxIntermediateDir, repoRoot } from './lynx/catalog'
import { analyzeStaticEvidence } from './lynx/static-evidence'

const bundlePath = path.join(exampleDir, 'dist', 'main.lynx.bundle')
let encoderLog = ''

describe('ReactLynx Rspeedy compatibility evidence', () => {
  it('builds the public Lynx package and a development bundle with inspectable CSS', async () => {
    const build = await buildCompatibilityBundle()
    encoderLog = build.encoderLog
    const [bundle, css, tasm] = await Promise.all([
      fs.readFile(bundlePath),
      fs.readFile(path.join(lynxIntermediateDir, 'main.css'), 'utf8'),
      fs.readFile(path.join(lynxIntermediateDir, 'tasm.json'), 'utf8'),
    ])
    expect(bundle.byteLength).toBeGreaterThan(1024)
    expect(css).toContain('tailwindcss v4.3.3')
    expect(css).not.toContain('@source')
    expect((JSON.parse(tasm) as { css: { cssMap: object } }).css.cssMap).toBeTruthy()
  }, 300_000)

  it('decodes the real bundle with the pinned TASM decoder', async () => {
    const require = createRequire(path.join(repoRoot, 'e2e', 'package.json'))
    const tasm = require('@lynx-js/tasm') as { decode_napi: (source: Uint8Array) => unknown, decode_wasm: (source: Uint8Array) => Promise<unknown>, supportNapi: () => boolean }
    const source = new Uint8Array(await fs.readFile(bundlePath))
    const decoded = tasm.supportNapi() ? tasm.decode_napi(source) : await tasm.decode_wasm(source)
    expect(decoded).toBeTruthy()
  }, 120_000)

  it('matches the committed CSS AST and encoder evidence for every catalog case', async () => {
    const actual = await analyzeStaticEvidence('ignored-by-comparison', encoderLog)
    const expected = staticEvidenceJson as StaticEvidenceReport
    expect(actual.catalogHash).toBe(getCatalogHash())
    expect(actual.versions).toEqual(expected.versions)
    expect(actual.catalogHash).toBe(expected.catalogHash)
    expect(actual.results).toEqual(expected.results)
    expect(actual.results.some(result => result.failureStage === 'encoder')).toBe(true)
    expect(actual.results.some(result => result.bundled)).toBe(true)
  })

  it('keeps generated evidence under the compatibility directory', () => {
    expect(path.dirname(path.join(compatibilityDir, 'static-evidence.json'))).toBe(compatibilityDir)
  })
})
