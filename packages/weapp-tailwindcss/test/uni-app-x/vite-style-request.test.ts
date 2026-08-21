import { isPreprocessorRequest, normalizeRelativeTailwindReferences, resolvePreprocessorTransform } from '@/uni-app-x/vite/style-request'

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

  it.each([
    ['微信小程序', '/project/components/up-checkbox.uvue?vue&type=style&index=0&lang.scss'],
    ['H5', '/project/components/up-checkbox.uvue?vue&type=style&index=0&lang.scss'],
  ])('leaves %s preprocessor requests to the framework', (_target, id) => {
    const source = [
      '$up-checkbox-icon-wrap-margin-right: 6px !default;',
      '.up-checkbox { @apply text-white; }',
    ].join('\n')

    expect(resolvePreprocessorTransform(source, id, 'scss', {
      isIosPlatform: false,
      isNativeAppStyleTarget: false,
    })).toEqual({ result: undefined })
  })

  it.each([
    '/project/components/up-checkbox.uvue?vue&type=style&index=0&lang.scss',
    '/project/components/up-checkbox.uvue?vue=&type=style&index=0&lang=scss',
    '/project/components/up-checkbox.lang.less.css',
    '/project/styles/up-checkbox.scss?direct',
  ])('recognizes preprocessor request form %s', (id) => {
    expect(isPreprocessorRequest(id)).toBe(true)
  })

  it('keeps Native preprocessor requests in the local @apply pipeline', () => {
    expect(resolvePreprocessorTransform(
      '.up-checkbox { @apply text-white; }',
      '/project/components/up-checkbox.uvue?vue&type=style&index=0&lang.scss',
      'scss',
      {
        isIosPlatform: false,
        isNativeAppStyleTarget: true,
      },
    )).toBeUndefined()
  })
})
