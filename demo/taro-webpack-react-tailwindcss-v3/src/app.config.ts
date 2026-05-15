const isWatchRegression = process.env.WEAPP_TW_WATCH_REGRESSION === '1'

const watchRegressionSubPackages = [
  {
    root: 'sub-normal',
    pages: ['pages/index'],
  },
  {
    root: 'sub-independent',
    pages: ['pages/index'],
    independent: true,
  },
]

export default {
  pages: isWatchRegression
    ? [
        'pages/index/index',
      ]
    : [
        'pages/index/index',
        'pages/debug/index',
        'pages/debug/other',
        'pages/debug/before',
        'pages/debug/arbitraryVariants',
      ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  subPackages: isWatchRegression
    ? watchRegressionSubPackages
    : [
        {
          root: 'moduleA',
          pages: [
            'pages/index',
          ],
        },
        ...watchRegressionSubPackages,
        {
          root: 'moduleB',
          pages: [
            'pages/index',
          ],
          independent: true,
        },
        {
          root: 'moduleC',
          pages: [
            'pages/index',
          ],
          independent: true,
        },
        // {
        //   root: 'pages/sub',
        //   pages: ['sub-one/index'],
        //   independent: true,
        // }
      ],
}
