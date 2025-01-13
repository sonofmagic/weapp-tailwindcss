import { defineAppJson } from 'weapp-vite/json'

export default defineAppJson(
  {
    pages: [
      'pages/index/index',
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
