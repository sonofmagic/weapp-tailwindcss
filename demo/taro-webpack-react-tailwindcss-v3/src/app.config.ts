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
  subPackages: [
    {
      root: "moduleA",
      pages: [
        "pages/index"
      ]
    },
    {
      root: 'sub-normal',
      pages: ['pages/index'],
    },
    {
      root: 'sub-independent',
      pages: ['pages/index'],
      independent: true,
    },
    {
      root: "moduleB",
      pages: [
        "pages/index",
      ],
      independent: true
    },
    {
      root: "moduleC",
      pages: [
        "pages/index",
      ],
      independent: true
    },
    // {
    //   root: 'pages/sub',
    //   pages: ['sub-one/index'],
    //   independent: true,
    // }
  ]
}
