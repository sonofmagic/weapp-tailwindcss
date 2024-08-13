import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Weapp-vite',
  description: '把现代化的开发模式带入小程序',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '指引', link: '/guide' },
    ],

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
  },
})
