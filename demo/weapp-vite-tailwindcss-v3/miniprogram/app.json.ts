import { defineAppJson } from 'weapp-vite/json'

export default defineAppJson(
  {
    pages: [
      'pages/index/index',
      'pages/index/merge/index',
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
      navigationBarTextStyle: 'black',
      navigationBarTitleText: 'Weixin',
      navigationBarBackgroundColor: '#ffffff',
    },
    componentFramework: 'glass-easel',
    lazyCodeLoading: 'requiredComponents',
    sitemapLocation: 'sitemap.json',
  },
)
