import type { ThemeConfig } from '@docusaurus/preset-classic'

const footerLinks: NonNullable<ThemeConfig['footer']>['links'] = [
  {
    title: '文档',
    items: [
      {
        label: '指南',
        to: '/docs/intro',
      },
      {
        label: '配置项',
        to: '/docs/api/',
      },
      {
        label: '常见问题',
        to: '/docs/issues/',
      },
      {
        label: '博客',
        href: '/blog',
      },
    ],
  },
  {
    title: '更多',
    items: [
      {
        label: 'GitHub',
        href: 'https://github.com/sonofmagic/weapp-tailwindcss',
      },
      {
        label: 'Code of Conduct',
        href: 'https://github.com/sonofmagic/weapp-tailwindcss/blob/main/CODE_OF_CONDUCT.md',
      },
      {
        label: 'weapp-vite',
        href: 'https://vite.icebreaker.top',
      },
    ],
  },
]

export const footerCustomFields = {
  legal: {
    href: '/docs/copyright',
    label: 'Copyright',
    target: '_self',
  },
  owner: {
    href: 'https://github.com/sonofmagic',
    name: 'sonofmagic',
  },
  poweredBy: {
    prefix: '本站由',
    href: 'https://www.netlify.com',
    label: 'Netlify',
    logoAlt: 'Netlify logo',
    logoSrc: '/img/logo-netlify.png',
  },
} as const

export const footer: NonNullable<ThemeConfig['footer']> = {
  style: 'dark',
  links: footerLinks,
}
