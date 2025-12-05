import type { ThemeConfig } from '@docusaurus/preset-classic'

const navbar: NonNullable<ThemeConfig['navbar']> = {
  title: 'weapp-tailwindcss',
  logo: {
    alt: 'weapp tailwindcss Logo',
    src: 'img/logo.png',
  },
  items: [
    {
      type: 'doc',
      docId: 'intro',
      position: 'left',
      label: '指南',
    },

    {
      type: 'doc',
      label: '原子化 CSS 专题',
      docId: 'tailwindcss/index',
      position: 'left',
    },

    {
      type: 'doc',
      label: '生态及解决方案',
      docId: 'community/templates',
    },
    {
      type: 'doc',
      label: '常见问题',
      docId: 'issues/index',
    },
    {
      type: 'doc',
      label: '案例展示',
      docId: 'showcase/index',
    },

    {
      type: 'doc',
      label: '更新与迁移',
      docId: 'migrations/v3',
    },
    {
      type: 'doc',
      docId: 'api/interfaces/UserDefinedOptions',
      position: 'left',
      label: '配置项',
    },
    {
      href: '/blog',
      position: 'left',
      label: '博客',
    },
    {
      href: 'https://vite.icebreaker.top/',
      position: 'left',
      label: '🔥Weapp-vite',
    },

    {
      href: 'https://github.com/sonofmagic/weapp-tailwindcss',
      label: 'GitHub',
      position: 'right',
    },
  ],
}

export default navbar
