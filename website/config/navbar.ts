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
      label: '生态',
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
      label: '迁移',
      docId: 'migrations/v5',
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
      type: 'doc',
      label: 'Tailwind 专题',
      docId: 'tailwindcss/index',
      position: 'left',
    },
    {
      href: 'https://vite.icebreaker.top/',
      position: 'left',
      label: 'Weapp-vite',
      className: 'navbar__weapp-vite-link',
    },

    {
      type: 'dropdown',
      label: 'v5',
      position: 'right',
      items: [
        {
          label: 'v5 当前版本',
          href: '/',
        },
        {
          label: 'v4 最新版本',
          href: 'https://v4.tw.icebreaker.top/',
        },
      ],
    },
    {
      href: 'https://atomgit.com/sonofmagic/weapp-tailwindcss',
      label: 'AtomGit',
      className: 'navbar__atomgit-link',
      position: 'right',
    },
    {
      href: 'https://github.com/sonofmagic/weapp-tailwindcss',
      label: 'GitHub',
      className: 'navbar__github-link',
      position: 'right',
    },
  ],
}

export default navbar
