export default defineAppConfig({
  pages: [
    'pages/index/index',
  ],
  subPackages: [
    {
      root: 'sub-normal',
      pages: ['pages/index'],
    },
    {
      root: 'sub-independent',
      pages: ['pages/index'],
      independent: true,
    },
  ],
  window: {
    navigationBarTitleText: 'subpackage taro webpack v4',
  },
})
