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
              text: '为什么选 Weapp-Vite',
              link: '/guide/why',
            },
            { text: '开始', link: '/guide/' },
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
