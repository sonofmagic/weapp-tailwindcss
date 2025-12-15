import type { ThemeConfig } from '@docusaurus/preset-classic'
import { defaultMetaDescription, defaultMetaTitle, siteName, siteUrl, socialImageUrl } from './siteMetadata'

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
    property: 'og:title',
    content: defaultMetaTitle,
  },
  {
    property: 'og:description',
    content: defaultMetaDescription,
  },
  {
    property: 'og:image',
    content: socialImageUrl,
  },
  {
    property: 'og:url',
    content: siteUrl,
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
    content: siteName,
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
  {
    name: 'twitter:title',
    content: defaultMetaTitle,
  },
]

export default themeMetadata
