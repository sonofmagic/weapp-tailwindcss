import type { ThemeConfig } from '@docusaurus/preset-classic'
import { defaultMetaDescription, socialImageUrl } from './siteMetadata'

const themeMetadata: NonNullable<ThemeConfig['metadata']> = [
  {
    name: 'keywords',
    content: 'weapp,小程序,tailwindcss,原子类,uni-app,taro,rax,mpx,native,remax,原生,webpack,plugin,vite,gulp,wxss,wxml',
  },
  {
    name: 'description',
    content: defaultMetaDescription,
  },
  {
    name: 'author',
    content: 'icebreaker & weapp-tailwindcss contributors',
  },
  {
    name: 'theme-color',
    content: '#0ea5e9',
  },
  {
    property: 'og:type',
    content: 'website',
  },
  {
    property: 'og:locale',
    content: 'zh_CN',
  },
  {
    property: 'og:site_name',
    content: 'weapp-tailwindcss',
  },
  {
    property: 'og:image:alt',
    content: 'weapp-tailwindcss 项目标识',
  },
  {
    name: 'twitter:card',
    content: 'summary_large_image',
  },
  {
    name: 'twitter:image',
    content: socialImageUrl,
  },
  {
    name: 'twitter:description',
    content: defaultMetaDescription,
  },
]

export default themeMetadata
