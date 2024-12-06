import { removeFileExtension } from '@/utils'

describe('removeFileExtension', () => {
  it('should remove single extension', () => {
    const filePath = '/some/path/file.txt'
    const result = removeFileExtension(filePath)
    expect(result).toBe('/some/path/file')
  })

  it('should remove nested extensions', () => {
    const filePath = '/some/path/file.wxs.ts'
    const result = removeFileExtension(filePath)
    expect(result).toBe('/some/path/file')
  })

  it('should handle files with no extension', () => {
    const filePath = '/some/path/file'
    const result = removeFileExtension(filePath)
    expect(result).toBe('/some/path/file')
  })

  it('should handle hidden files with extensions', () => {
    const filePath = '/some/path/.env.local'
    const result = removeFileExtension(filePath)
    expect(result).toBe('/some/path/.env')
  })

  it('should handle hidden files without extensions', () => {
    const filePath = '/some/path/.env'
    const result = removeFileExtension(filePath)
    expect(result).toBe('/some/path/.env')
  })

  it('should handle file paths with multiple dots in directory names', () => {
    const filePath = '/some/path.with.dots/file.txt'
    const result = removeFileExtension(filePath)
    expect(result).toBe('/some/path.with.dots/file')
  })

  it('should handle deeply nested directories and file names', () => {
    const filePath = '/a/very/long/path/with/many/levels/file.tar.gz'
    const result = removeFileExtension(filePath)
    expect(result).toBe('/a/very/long/path/with/many/levels/file')
  })

  it('should handle file paths with no directory', () => {
    const filePath = 'file.wxs.ts'
    const result = removeFileExtension(filePath)
    expect(result).toBe('file')
  })

  it('should handle empty string input', () => {
    const filePath = ''
    const result = removeFileExtension(filePath)
    expect(result).toBe('')
  })

  it('should handle special characters in file names', () => {
    const filePath = '/path/to/fi!le@#$%.txt'
    const result = removeFileExtension(filePath)
    expect(result).toBe('/path/to/fi!le@#$%')
  })

  it('should handle paths with only extensions (like `.gitignore`)', () => {
    const filePath = '/path/.gitignore'
    const result = removeFileExtension(filePath)
    expect(result).toBe('/path/.gitignore')
  })
})
