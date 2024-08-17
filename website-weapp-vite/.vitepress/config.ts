import { defineConfig } from 'vitepress'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Weapp-vite',
  description: '把现代化的开发模式带入小程序',
  themeConfig: {

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '指引', link: '/guide' },
    ],
    logo: '/logo.svg',

    sidebar: {
      '/guide/': [
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
            { text: 'Tailwindcss', link: '/guide/tailwindcss' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sonofmagic/weapp-tailwindcss' },
    ],
    editLink: {
      pattern: 'https://github.com/sonofmagic/weapp-tailwindcss/edit/main/website-weapp-vite/:path',
      text: '改进此页面',
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
    // @ts-ignore
    codeTransformers: [transformerTwoslash()],
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
  ],
  sitemap: {
    hostname: 'https://vite.icebreaker.top',
  },

})
