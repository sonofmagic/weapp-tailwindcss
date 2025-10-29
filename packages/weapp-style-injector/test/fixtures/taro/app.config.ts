declare const defineAppConfig: <T>(config: T) => T

export default defineAppConfig({
  pages: ['pages/index/index'],
  subPackages: [
    {
      root: 'taro-sub',
      pages: ['pages/home/index'],
    },
    {
      root: 'taro-missing',
      pages: ['pages/other/index'],
    },
  ],
  subpackages: [
    {
      root: 'legacy-sub',
      pages: ['pages/legacy/index'],
    },
  ],
})
