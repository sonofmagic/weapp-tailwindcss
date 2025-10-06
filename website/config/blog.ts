import type { Options as ClassicOptions } from '@docusaurus/preset-classic'

function createBlogOptions(): NonNullable<ClassicOptions['blog']> {
  return {
    remarkPlugins: [
      [
        require('@docusaurus/remark-plugin-npm2yarn'),
        { converters: ['pnpm'] },
      ],
    ],
    blogTitle: 'weapp-tailwindcss 博客',
    blogDescription: '沉淀 tailwindcss 在小程序生态中的最佳实践、版本更新与生态动态。',
    showReadingTime: true,
    postsPerPage: 10,
    feedOptions: {
      type: 'all',
      title: 'weapp-tailwindcss 博客订阅',
      description: 'tailwindcss 在小程序与多端开发中的更新、案例与教程资讯。',
      language: 'zh-CN',
    },
  }
}

export default createBlogOptions
