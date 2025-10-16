import { Buffer } from 'node:buffer'
import { describe, expect, it } from 'vitest'
import { md5, removeAllExtensions } from '@/node'

describe('node helpers', () => {
  it('computes deterministic md5 hash', () => {
    expect(md5('weapp-tailwindcss')).toBe('ddec40ea318bfbdb5eb4b198573383f0')
    expect(md5(Buffer.from('buffer-input'))).toBe('820d78aede7cc68e8d352b8f2f2907ba')
  })

  it('removes every extension segment from file names', () => {
    expect(removeAllExtensions('/some/path/file.wxs.ts')).toBe('/some/path/file')
    expect(removeAllExtensions('file.ts')).toBe('file')
    expect(removeAllExtensions('')).toBe('')
  })

  it('keeps dotfiles and directory dots intact', () => {
    expect(removeAllExtensions('/some/path/.env.local')).toBe('/some/path/.env')
    expect(removeAllExtensions('/some/path/.gitignore')).toBe('/some/path/.gitignore')
    expect(removeAllExtensions('/nested.dir/config.json')).toBe('/nested.dir/config')
  })

  it('normalises windows-style paths', () => {
    expect(removeAllExtensions('C:\\\\temp\\\\file.prod.wxss.js')).toBe('C:/temp/file')
  })
})
