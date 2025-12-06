/* eslint-disable ts/no-require-imports */
import type { Options as ClassicOptions, ThemeConfig } from '@docusaurus/preset-classic'
import type { Config } from '@docusaurus/types'

// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
import process from 'node:process'
import createBlogOptions from './config/blog'
import { footer, footerCustomFields } from './config/footer'
import headTags from './config/headTags'
import navbar from './config/navbar'
import { siteUrl } from './config/siteMetadata'
import themeMetadata from './config/themeMetadata'
import PrismDark from './src/utils/prismDark'
import PrismLight from './src/utils/prismLight'

const hostingProvider = process.env.PROVIDER
const isGithub = String.prototype.toLowerCase.call(hostingProvider || '') === 'github'
const isProd = process.env.NODE_ENV === 'production'
console.log(`[hostingProvider]: ${hostingProvider}, [isGithub]: ${isGithub}`)

const config: Config = {
  title: 'weapp-tailwindcss 把tailwindcss带给小程序开发者们',
  tagline: '用tailwindcss来开发小程序吧!这是一个webpack/vite/gulp插件集合,兼容了各种用这类打包的框架,比如uni-app,tarojs,rax,mpx,remax,原生等等.伟大的icebreaker部署了这个文档网站',
  favicon: 'favicon.ico',

  // Set the production url of your site here
  url: siteUrl,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: isGithub ? '/weapp-tailwindcss/' : '/',
  trailingSlash: false,
  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'sonofmagic', // Usually your GitHub org/user name.
  projectName: 'weapp-tailwindcss', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-cn',
    locales: ['zh-cn'], // , 'en'
    localeConfigs: {
      // en: {
      //   label: 'English',
      //   direction: 'ltr'
      // },
      'zh-cn': {
        label: '中文',
        direction: 'ltr',
      },
    },
  },
  headTags,
  scripts: [{ src: 'https://hm.baidu.com/hm.js?61f3de7065e36044e6d5f201632bc368', async: true }],
  customFields: {
    footer: footerCustomFields,
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: 'sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/sonofmagic/weapp-tailwindcss/tree/main/website',
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
          ],
        },
        pages: {
          remarkPlugins: [require('@docusaurus/remark-plugin-npm2yarn')],
        },
        blog: createBlogOptions(),
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
        // },
        theme: {
          // 升级到 docusaurus@3 之后 docusaurus-plugin-sass 似乎挂了
          customCss: ['./src/css/custom.scss'], // require.resolve('./src/css/custom.scss'),
        },
        // 在本地开发/局域网联调时关闭 gtag，避免外网脚本加载失败导致 window.gtag 未定义
        gtag: isProd
          ? {
              trackingID: 'G-S81Q4GRTPM',
            }
          : undefined,
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
        svgr: {
          svgrConfig: {

          },
        },
      } satisfies ClassicOptions,
    ],
  ],
  plugins: [
    [
      'docusaurus-plugin-llms',
      {

      },
    ],
    [
      'docusaurus-plugin-sass',
      {
        sassOptions: {
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    ],

    function twPlugin() {
      return {
        name: 'docusaurus-tailwindcss',
        configurePostCss(postcssOptions) {
          // Appends TailwindCSS and AutoPrefixer.

          postcssOptions.plugins.push(require('tailwindcss'))

          postcssOptions.plugins.push(require('autoprefixer'))
          return postcssOptions
        },
      }
    },
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'api',
        entryPoints: ['../packages/weapp-tailwindcss/src/typedoc.export.ts'],
        tsconfig: '../packages/weapp-tailwindcss/tsconfig.typedoc.json',
        readme: 'none',
        watch: process.env.TYPEDOC_WATCH,
        skipErrorChecking: true,
        lang: 'zh',
      },
    ],
  ],
  themeConfig:
    {
      // https://docusaurus.io/zh-CN/docs/markdown-features/toc#table-of-contents-heading-level
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 3,
      },
      colorMode: {
        defaultMode: 'dark',
      },
      metadata: themeMetadata,
      algolia: {
        apiKey: '614e6b4532a0b92d440e4676381cc600',
        appId: '9Y7BJULSEW',
        indexName: 'weapp-tw-icebreaker',
        contextualSearch: true,
      },
      // Replace with your project's social card
      image: 'img/logo.png',
      navbar,
      footer,
      prism: {
        theme: PrismLight,
        darkTheme: PrismDark,
        // https://github.com/FormidableLabs/prism-react-renderer/blob/master/packages/generate-prism-languages/index.ts#L9-L23
        additionalLanguages: ['json', 'javascript', 'css', 'clike', 'bash', 'scss', 'yaml', 'typescript', 'diff'],
      },
      // announcementBar: {
      //   isCloseable: true,
      //   content: `<a href="">weapp-tailwindcss 现已经支持 tailwindcss 4!</a>`,
      // },
    } satisfies ThemeConfig,
  markdown: {
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
    mermaid: true,
  },
  themes: [
    '@docusaurus/theme-live-codeblock',
    '@docusaurus/theme-mermaid',
  ],
}

module.exports = config
