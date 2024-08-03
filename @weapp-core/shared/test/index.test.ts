import { removeExtension } from '@/index'

describe('removeExtension', () => {
  it('should remove all extensions from a file name', () => {
    expect(removeExtension('file.txt')).toBe('file')
    expect(removeExtension('document.pdf')).toBe('document')
    expect(removeExtension('archive.tar.gz')).toBe('archive.tar')
  })

  it('should return the same file name if there is no extension', () => {
    expect(removeExtension('file')).toBe('file')
    expect(removeExtension('document')).toBe('document')
  })

  it('should handle hidden files correctly', () => {
    // expect(removeExtension('.hiddenfile')).toBe('.hiddenfile')
    expect(removeExtension('.hiddenfile.txt')).toBe('.hiddenfile')
  })

  it('should handle file names with multiple dots', () => {
    expect(removeExtension('my.file.name.txt')).toBe('my.file.name')
    expect(removeExtension('my.file.name')).toBe('my.file')
  })

  it('should handle empty string', () => {
    expect(removeExtension('')).toBe('')
  })

  // it('should handle strings with only an extension', () => {
  //   expect(removeExtension('.gitignore')).toBe('.gitignore')
  // })
})
