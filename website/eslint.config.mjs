import { icebreaker } from '@icebreakers/eslint-config'

const config = icebreaker({
  tailwindcss: {
    tailwindConfig: './tailwind.config.ts',
  },
  react: false,
  markdown: false,
}).prepend({
  ignores: [
    // Docusaurus 生成产物不参与源码 lint。
    '.docusaurus/**',
    'build/**',
    'playwright-report/**',
    // 文档 MDX 由 Docusaurus 编译校验。
    '**/*.mdx',
    // 静态 Vue 模板是供下载的示例源码，website ESLint 不按 Vue SFC 解析。
    'static/wetw/templates/**/*.vue',
  ],
}).overrideRules({
  'better-tailwindcss/no-unknown-classes': 'warn',
  'better-tailwindcss/enforce-consistent-line-wrapping': 'warn',
  'better-tailwindcss/enforce-consistent-class-order': 'warn',
})

export default config
