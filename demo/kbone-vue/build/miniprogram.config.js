/**
 * 配置参考：https://wechat-miniprogram.github.io/kbone/docs/config/
 */

module.exports = {
  origin: 'https://test.miniprogram.com',
  entry: '/',
  router: {
    home: ['/(home|index)?', '/index.html', '/test/(home|index)'],
    other: ['/test/list/:id', '/test/detail/:id']
  },
  redirect: {
    notFound: 'home',
    accessDenied: 'home'
  },
  generate: {
    autoBuildNpm: 'npm'
  },
  app: {
    backgroundTextStyle: 'dark',
    navigationBarTextStyle: 'white',
    navigationBarTitleText: 'kbone'
  },
  appExtraConfig: {
    sitemapLocation: 'sitemap.json'
  },
  global: {
    share: true,
    windowScroll: false,
    backgroundColor: '#F7F7F7'
  },
  pages: {},
  optimization: {
    domSubTreeLevel: 10,

    elementMultiplexing: true,
    textMultiplexing: true,
    commentMultiplexing: true,
    domExtendMultiplexing: true,

    styleValueReduce: 5000,
    attrValueReduce: 5000
  },
  projectConfig: {
    projectname: 'kbone-vue-app',
    appid: 'wxb3d842a4a7e3440d'
  }
}
