export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/index/test'
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
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
})
