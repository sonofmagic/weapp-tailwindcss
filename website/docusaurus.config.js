// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')
const nodeExternals = require('webpack-node-externals')
const hostingProvider = process.env.PROVIDER
const isGithub = String.prototype.toLowerCase.call(hostingProvider || '') === 'github'
console.log(`[hostingProvider]: ${hostingProvider}, [isGithub]: ${isGithub}`)

/**
 *
 * @param {{
 * target?:string
 * rel?:string
 * href?:string
 * innerText?:string
 * }} params
 * @returns
 */
function createLink(params = {}) {
  const { target = '_blank', rel = 'nofollow', href, innerText = '' } = params

  return `<a ${target ? `target="${target}"` : ''} ${rel ? `rel="${rel}"` : ''} ${href ? `href="${href}"` : ''}">${innerText}</a>`
}

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'weapp-tw 把tailwindcss带给小程序开发者们',
  tagline:
    '用tailwindcss来开发小程序吧！这是一个 webpack / vite 插件，兼容了各种用这类打包的框架，比如 uni-app, uni-app vite, taro, rax, mpx, native, remax, 原生等等. 伟大的 icebreaker 部署了这个文档网站',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://weapp-tw.icebreaker.top',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: isGithub ? '/weapp-tailwindcss-webpack-plugin/' : '/',

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
    locales: ['zh-cn'], //, 'en'
    localeConfigs: {
      // en: {
      //   label: 'English',
      //   direction: 'ltr'
      // },
      'zh-cn': {
        label: '中文',
        direction: 'ltr'
      }
    }
  },
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://hm.baidu.com'
      }
    }
  ],
  scripts: [{ src: 'https://hm.baidu.com/hm.js?61f3de7065e36044e6d5f201632bc368', async: true }],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/dev/website'
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
        // },
        theme: {
          customCss: require.resolve('./src/css/custom.scss')
        },
        gtag: {
          trackingID: 'G-S81Q4GRTPM'
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml'
        }
      })
    ]
  ],
  plugins: [
    'docusaurus-plugin-sass',
    function twPlugin(context, options) {
      return {
        name: 'docusaurus-tailwindcss',
        configurePostCss(postcssOptions) {
          // Appends TailwindCSS and AutoPrefixer.
          postcssOptions.plugins.push(require('tailwindcss'))
          postcssOptions.plugins.push(require('autoprefixer'))
          return postcssOptions
        }
      }
    }
    // function nodeLoader(context, options) {
    //   return {
    //     name: 'canvas-node-loader-plugin',
    //     configureWebpack(config, isServer, utils) {
    //       if (isServer) {
    //         return {
    //           target: 'node',
    //           // ReferenceError: __dirname is not defined
    //           node: {
    //             __dirname: true,
    //           },
    //           externals: [nodeExternals()],
    //           module: {
    //             rules: [
    //               {
    //                 test: /\.node$/,
    //                 loader: "node-loader",
    //               }
    //             ]
    //           }
    //         }
    //       }
    //       return {

    //       }

    //     }
    //   }
    // }
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        {
          name: 'keywords',
          content: 'weapp, 小程序, tailwindcss, 原子类, uni-app, taro, rax, mpx, native, remax, 原生, webpack plugin,vite, wxss, wxml'
        }
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
        contextualSearch: true
      },
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'weapp-tw',
        logo: {
          alt: 'weapp tailwindcss Logo',
          src: 'img/android-chrome-256x256.png'
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: '指南'
          },
          {
            type: 'doc',
            docId: 'options/index',
            position: 'left',
            label: '配置项'
          },
          {
            type: 'doc',
            label: '常见问题',
            docId: 'issues/index'
          },
          {
            href: 'https://icebreaker.top/',
            position: 'left',
            label: '博客'
          },
          // { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin',
            label: 'GitHub',
            position: 'right'
          }
        ]
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '文档',
            items: [
              {
                label: '指南',
                to: '/docs/intro'
              },
              {
                label: '配置项',
                to: '/docs/options/'
              },
              {
                label: '常见问题',
                to: '/docs/issues/'
              }
            ]
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
                label: '博客',
                href: 'https://icebreaker.top'
              },
              {
                label: 'GitHub',
                href: 'https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin'
              }
            ]
          }
        ],
        // `<a target="_blank" rel="nofollow" href="http://beian.miit.gov.cn">苏ICP备19002675号-2</a>`
        copyright: `Copyright © ${new Date().getFullYear()} icebreaker ${createLink({
          href: 'http://beian.miit.gov.cn',
          innerText: '苏ICP备19002675号-2'
        })}`
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    })
}

module.exports = config
