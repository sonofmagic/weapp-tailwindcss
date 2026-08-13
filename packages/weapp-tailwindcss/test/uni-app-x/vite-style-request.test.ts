import { normalizeRelativeTailwindReferences } from '@/uni-app-x/vite/style-request'

describe('uni-app-x vite style request', () => {
  it('resolves relative Tailwind references from the source SFC', () => {
    expect(normalizeRelativeTailwindReferences(
      '@reference "../../main.css";\n.card { @apply flex; }',
      '/project/pages/index/index.uvue?vue&type=style&index=0&lang.scss',
    )).toContain('@reference "/project/main.css";')
  })

  it('normalizes Windows source paths as module ids', () => {
    expect(normalizeRelativeTailwindReferences(
      '@reference "..\\..\\main.css";',
      'C:\\project\\pages\\index\\index.uvue?vue&type=style',
    )).toBe('@reference "C:/project/main.css";')
  })

  it('preserves package, import-map, and absolute references', () => {
    const source = [
      '@reference "tailwindcss";',
      '@reference "#theme";',
      '@reference "/project/main.css";',
    ].join('\n')
    expect(normalizeRelativeTailwindReferences(source, '/project/pages/index.uvue')).toBe(source)
  })
})
