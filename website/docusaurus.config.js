// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'weapp-tailwindcss-webpack-plugin',
  tagline: '把tailwindcss，带给小程序开发者们',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://weapp-tw.icebreaker.top',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'sonofmagic', // Usually your GitHub org/user name.
  projectName: 'weapp-tailwindcss-webpack-plugin', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },

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
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // algolia: {},
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
        copyright: `Copyright © ${new Date().getFullYear()} icebreaker`
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    })
}

module.exports = config
