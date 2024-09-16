import type { DefaultTheme } from 'vitepress/theme'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { defineConfig } from 'vitepress'
// @ts-ignore
import typedocSidebar from '../api/typedoc-sidebar.json'

const sharedSidebarItems: DefaultTheme.SidebarItem[] = [
  {
    text: '指引',
    items: [
      {
        text: '什么是 Weapp-vite',
        link: '/guide/what-is-weapp-vite',
      },
      { text: '快速开始', link: '/guide/' },
      { text: 'Alias 别名', link: '/guide/alias' },
      { text: '模块化风格', link: '/guide/module' },
      { text: 'Tailwindcss 集成', link: '/guide/tailwindcss' },
      { text: '调试与贡献', link: '/guide/debug' },
    ],
  },
  {
    text: '社区',
    items: [
      {
        text: '加入技术交流群',
        link: '/community/group',
      },
    ],
  },
  { text: '配置和 API 参考', link: 'config' },
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Weapp-vite',
  description: '把现代化的开发模式带入小程序',
  outDir: 'dist',
  themeConfig: {

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '指引', link: '/guide' },
      { text: '参考', link: '/config' },
      { text: '博客', link: '/blog' },
      { text: 'API', link: '/api/' },
    ],
    logo: '/logo.svg',

    sidebar: {
      '/api/': [{
        text: 'API',
        items: typedocSidebar,
      }],
      '/guide/': sharedSidebarItems,
      '/community/': sharedSidebarItems,
      '/blog/': [
        {
          text: '文章目录',
          link: '/blog/',
          items: [
            // { text: '目录', link: '/blog/' },
            {
              text: 'Weapp-vite 发布了!',
              link: '/blog/announce',
            },
          ],
        },
      ],
      '/config/': [
        {
          text: '参考',
          items: [
            {
              text: 'Weapp-vite 配置项',
              link: '/config/',
            },
            {
              text: '配置 Vite',
              link: 'https://cn.vitejs.dev/config/',
            },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sonofmagic/weapp-tailwindcss' },
    ],
    editLink: {
      pattern: 'https://github.com/sonofmagic/weapp-tailwindcss/edit/main/website-weapp-vite/:path',
      text: '为此页提供修改建议',
    },
    outline: {
      label: '本页目录',
      level: [2, 3],
    },
    footer: {
      message: `Released under the MIT License.`,
      copyright: 'Copyright © 2024-present sonofmagic',
    },
    search: {
      provider: 'local',
    },

  },
  markdown: {
    codeTransformers: [transformerTwoslash()],
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    // google analytics start
    [
      'script',
      { async: 'true', src: 'https://www.googletagmanager.com/gtag/js?id=G-89RF58SCYG' },
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-89RF58SCYG');`,
    ],
    //  // google analytics end
    [
      'script',
      {},
      `var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?b19c15773e6c3ca95c3fb6087148a99b";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();`,
    ],
  ],
  sitemap: {
    hostname: 'https://vite.icebreaker.top',
  },
  lastUpdated: true,

})
