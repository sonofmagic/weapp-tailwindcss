export default {
  pages: [
    'pages/index/index',
    'pages/debug/index',
    'pages/debug/other',
    'pages/debug/before',
    'pages/debug/arbitraryVariants'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  subpackages: [
    {
      root: "moduleA",
      pages: [
        "pages/index"
      ]
    },
    {
      root: "moduleB",
      pages: [
        "pages/index",
      ],
      independent: true
    }
  ]
}
