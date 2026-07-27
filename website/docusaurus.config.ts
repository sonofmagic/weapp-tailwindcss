/* eslint-disable ts/no-require-imports */
import type { Options as ClassicOptions, ThemeConfig } from '@docusaurus/preset-classic'
import type { Config } from '@docusaurus/types'

// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import createBlogOptions from './config/blog'
import { getBuildLocale } from './config/buildLocale'
import { footer, footerCustomFields } from './config/footer'
import headTags from './config/headTags'
import { englishDocsDirectory, englishDocSourceFiles } from './config/localizedContent'
import navbar from './config/navbar'
import { siteUrl } from './config/siteMetadata'
import themeMetadata from './config/themeMetadata'
import { getSiteConfigCopy } from './src/i18n/siteConfig'
import PrismDark from './src/utils/prismDark'
import PrismLight from './src/utils/prismLight'

const hostingProvider = process.env.PROVIDER
const isGithub = String.prototype.toLowerCase.call(hostingProvider || '') === 'github'
const isProd = process.env.NODE_ENV === 'production'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tailwindCssEntry = path.resolve(__dirname, 'src/css/tailwind.css')
const workspacePackagePnpmStorePattern = /[\\/]packages(?:-runtime)?[\\/][^\\/]+[\\/]node_modules[\\/]\.pnpm[\\/]/
const buildLocale = getBuildLocale()
const isEnglishBuild = buildLocale === 'en'
const siteCopy = getSiteConfigCopy(buildLocale)
console.log(`[hostingProvider]: ${hostingProvider}, [isGithub]: ${isGithub}`)

const config: Config = {
  title: 'weapp-tailwindcss',
  tagline: siteCopy.tagline,
  favicon: 'favicon.ico',

  // Set the production url of your site here
  url: siteUrl,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: isGithub ? '/weapp-tailwindcss/' : '/',
  staticDirectories: isEnglishBuild ? ['static', 'static/en'] : ['static'],
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
    locales: ['zh-cn', 'en'],
    localeConfigs: {
      'en': {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
      },
      'zh-cn': {
        label: 'Chinese',
        direction: 'ltr',
        htmlLang: 'zh-CN',
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
          sidebarPath: isEnglishBuild ? 'sidebars.en.ts' : 'sidebars.ts',
          include: isEnglishBuild ? [...englishDocSourceFiles] : undefined,
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
          customCss: ['./src/css/tailwind.css', './src/css/custom.scss'], // require.resolve('./src/css/custom.scss'),
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
        title: isEnglishBuild ? 'weapp-tailwindcss doc index' : 'weapp-tailwindcss 文档索引',
        description: isEnglishBuild
          ? 'Official docs for bringing Tailwind CSS to mini apps across uni-app, Taro, native mini apps, and multiple builders.'
          : 'Tailwind CSS 小程序适配方案，覆盖 uni-app、Taro、原生小程序与多构建器场景的官方文档合集。',
        docsDir: isEnglishBuild
          ? [{ path: englishDocsDirectory, routeBasePath: 'docs' }]
          : 'docs',
        includeBlog: !isEnglishBuild,
        generateMarkdownFiles: true,
        excludeImports: true,
        removeDuplicateHeadings: true,
        keepFrontMatter: ['sidebar_label', 'title', 'description'],
        includeOrder: isEnglishBuild
          ? ['intro.md', 'quick-start/install.mdx']
          : [
              'docs/intro.md',
              'docs/quick-start/**',
              'docs/tailwindcss/v4-reference.md',
              'docs/tools/**',
              'docs/uni-app-x/**',
              'docs/community/templates.md',
              'docs/api/**',
              'docs/options/**',
              'docs/migrations/**',
              'docs/issues/**',
              'docs/ai/**',
            ],
        includeUnmatchedLast: true,
        rootContent: isEnglishBuild
          ? `LLM navigation notes:
- The English bundle contains the maintained introduction and installation guide.
- The site root is ${siteUrl}, and GitHub Pages uses the /weapp-tailwindcss/ prefix.
- MDX imports and duplicate headings are removed for easier model parsing, while key title/description frontmatter is preserved.`
          : `LLM 导航说明：
- 顺序为「入门 → 配置 → API → 迁移/问题 → AI 工作流」，覆盖 webpack/vite/gulp 与各类小程序框架。
- 站点根为 ${siteUrl}，GitHub Pages 下为 /weapp-tailwindcss/ 前缀。
- 已剔除 MDX import 与重复标题，便于模型解析；附带保留的标题/描述 frontmatter。`,
        fullRootContent: isEnglishBuild
          ? `Full doc bundle for offline or single-file loading:
- The bundle contains the maintained English introduction and installation guide.
- Content is ordered for onboarding, with key frontmatter preserved for summarization and indexing.`
          : `完整文档合辑，适合离线或单文件加载：
- quick-start/* 给出接入步骤与常见框架示例，options/*、api* 提供配置与 API 细节，ai/* 收录提示词与工作流。
- 内容按上手优先排序，并保留关键 frontmatter 供模型摘要与索引。`,
        customLLMFiles: [
          {
            filename: 'llms-quickstart.txt',
            includePatterns: isEnglishBuild
              ? ['intro.md', 'quick-start/install.mdx']
              : [
                  'docs/intro.md',
                  'docs/quick-start/**',
                  'docs/tailwindcss/v4-reference.md',
                  'docs/community/templates.md',
                  'docs/tools/**',
                  'docs/uni-app-x/**',
                  'docs/ai/**',
                ],
            fullContent: true,
            title: isEnglishBuild ? 'weapp-tailwindcss quick start' : 'weapp-tailwindcss 上手与 AI 工作流',
            description: isEnglishBuild
              ? 'Maintained English introduction and installation guidance for onboarding.'
              : '快速接入、模板、CLI 与 AI 辅助编排的完整内容，优先用于回答「如何开始」「如何让 AI 生成小程序代码」类问题。',
          },
          ...(!isEnglishBuild
            ? [{
                filename: 'llms-api.txt',
                includePatterns: [
                  'docs/options/**',
                  'docs/api/**',
                  'docs/issues/**',
                  'docs/migrations/**',
                ],
                fullContent: true,
                title: 'weapp-tailwindcss API 与配置参考',
                description: '包含插件配置、API 细节、常见问题与迁移指南，适合回答配置/兼容性问题。',
              }]
            : []),
        ],
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
        name: 'docusaurus-weapp-tailwindcss',
        configureWebpack() {
          const { WeappTailwindcss } = require('weapp-tailwindcss/webpack')

          return {
            devServer: {
              client: {
                overlay: false,
              },
            },
            snapshot: {
              // 包目录下的独立 pnpm 虚拟存储会和根 node_modules/.pnpm 产生解析歧义，交给 webpack 按普通文件快照处理。
              unmanagedPaths: [workspacePackagePnpmStorePattern],
            },
            plugins: [
              new WeappTailwindcss({
                generator: {
                  target: 'web',
                },
                tailwindcss: {
                  v4: {
                    base: __dirname,
                    cssEntries: [tailwindCssEntry],
                  },
                },
              }),
            ],
          }
        },
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(require('autoprefixer'))
          return postcssOptions
        },
      }
    },
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
