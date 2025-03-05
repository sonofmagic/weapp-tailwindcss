/* eslint-disable ts/no-require-imports */
import type { Options as ClassicOptions, ThemeConfig } from '@docusaurus/preset-classic'
import type { Config } from '@docusaurus/types'

// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
import process from 'node:process'
import PrismDark from './src/utils/prismDark'
import PrismLight from './src/utils/prismLight'

const hostingProvider = process.env.PROVIDER
const isGithub = String.prototype.toLowerCase.call(hostingProvider || '') === 'github'
console.log(`[hostingProvider]: ${hostingProvider}, [isGithub]: ${isGithub}`)

/**
 *
 * @param {{
 * target?:string
 * rel?:string
 * href?:string
 * textContent?:string
 * }} params
 * @returns
 */
function createLink(params: { target?: string, rel?: string, href?: string, textContent?: string } = {}) {
  const { target = '_blank', rel = 'nofollow', href, textContent = '' } = params

  return `<a ${target ? `target="${target}"` : ''} ${rel ? `rel="${rel}"` : ''} ${href ? `href="${href}"` : ''}">${textContent}</a>`
}

const config: Config = {
  title: 'weapp-tailwindcss 把tailwindcss带给小程序开发者们',
  tagline: '用tailwindcss来开发小程序吧!这是一个webpack/vite/gulp插件集合,兼容了各种用这类打包的框架,比如uni-app,tarojs,rax,mpx,remax,原生等等.伟大的icebreaker部署了这个文档网站',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://tw.icebreaker.top',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: isGithub ? '/weapp-tailwindcss/' : '/',
  trailingSlash: false,
  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'sonofmagic', // Usually your GitHub org/user name.
  projectName: 'weapp-tailwindcss', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

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
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://hm.baidu.com',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'baidu-site-verification',
        content: 'codeva-4ny6UzMmrn',
      },
    },
  ],
  scripts: [{ src: 'https://hm.baidu.com/hm.js?61f3de7065e36044e6d5f201632bc368', async: true }],

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
        blog: {
          remarkPlugins: [
            [
              require('@docusaurus/remark-plugin-npm2yarn'),
              { converters: ['pnpm'] },
            ],
          ],
          // ...
        },
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
        gtag: {
          trackingID: 'G-S81Q4GRTPM',
        },
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
      metadata: [
        {
          name: 'keywords',
          content: 'weapp,小程序,tailwindcss,原子类,uni-app,taro,rax,mpx,native,remax,原生,webpack,plugin,vite,gulp,wxss,wxml',
        },
        // {
        //   name: 'description',
        //   content:
        //     '用tailwindcss来开发小程序吧！这是一个 webpack / vite 插件，兼容了各种用这类打包的框架，比如 uni-app, uni-app vite, taro, rax, mpx, native, remax, 原生等等. 伟大的 icebreaker 部署了这个文档网站'
        // }
      ],
      algolia: {
        apiKey: '614e6b4532a0b92d440e4676381cc600',
        appId: '9Y7BJULSEW',
        indexName: 'weapp-tw-icebreaker',
        contextualSearch: true,
      },
      // Replace with your project's social card
      image: 'img/logo.png',
      navbar: {
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
            label: '优秀案例展示',
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
          // {
          //   to: 'docs/api/', // 'api' is the 'out' directory
          //   label: 'Types',
          //   position: 'left',
          // },
          // {
          //   to: 'docs/api-cli/', // 'api' is the 'out' directory
          //   label: 'Types-CLI',
          //   position: 'left',
          // },
          {
            href: 'https://vite.icebreaker.top/',
            position: 'left',
            label: '🔥Weapp-vite',
          },
          {
            href: 'https://icebreaker.top/',
            position: 'left',
            label: '博客',
          },
          // { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/sonofmagic/weapp-tailwindcss',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '文档',
            items: [
              {
                label: '指南',
                to: '/docs/intro',
              },
              {
                label: '配置项',
                to: '/docs/options/',
              },
              {
                label: '常见问题',
                to: '/docs/issues/',
              },
            ],
          },
          // {
          //   title: 'Community',
          //   items: [
          //     {
          //       label: 'Stack Overflow',
          //       href: 'https://stackoverflow.com/questions/tagged/docusaurus'
          //     },
          //     {
          //       label: 'Discord',
          //       href: 'https://discordapp.com/invite/docusaurus'
          //     },
          //     {
          //       label: 'Twitter',
          //       href: 'https://twitter.com/docusaurus'
          //     }
          //   ]
          // },
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
              {
                label: '博客',
                href: 'https://icebreaker.top',
              },
              {
                label: 'IceStack',
                href: 'https://ui.icebreaker.top/zh-CN',
              },
              {
                label: 'weapp-pandacss',
                href: 'https://github.com/sonofmagic/weapp-pandacss',
              },
            ],
          },
        ],
        // `<a target="_blank" rel="nofollow" href="http://beian.miit.gov.cn">苏ICP备19002675号-2</a>`
        copyright: `<div class="flex flex-col items-center justify-center space-y-2">
        <span>${createLink({
          href: '/docs/copyright',
          textContent: 'Copyright',
          target: '_self',
        })} © ${new Date().getFullYear()} ${createLink({
          href: 'https://github.com/sonofmagic',
          textContent: 'sonofmagic',
        })}</span>
        <span class="flex items-center">This site is powered by ${createLink({
          href: 'https://www.netlify.com',
          textContent: '<img class="w-10 ml-2" src="/img/logo-netlify.png" alt="Netlify badge" />',
        })}</span>
        </div>`,
      },
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
  },
  themes: ['@docusaurus/theme-live-codeblock'],
}

module.exports = config
