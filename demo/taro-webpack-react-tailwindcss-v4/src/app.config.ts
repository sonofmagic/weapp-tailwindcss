export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/issue-909/index',
    'pages/issue-928/index',
    'pages/issue-998/index'
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
