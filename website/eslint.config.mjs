import { fileURLToPath } from 'node:url'

import { icebreaker } from '@icebreakers/eslint-config'

const cwd = fileURLToPath(new URL('.', import.meta.url))
const tailwindConfig = fileURLToPath(new URL('tailwind.config.ts', import.meta.url))

const config = icebreaker({
  tailwindcss: {
    cwd,
    tailwindConfig,
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
}).append({
  rules: {
    'better-tailwindcss/enforce-canonical-classes': 'off',
    'better-tailwindcss/enforce-consistent-class-order': 'off',
    'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
    'better-tailwindcss/no-conflicting-classes': 'off',
    'better-tailwindcss/no-deprecated-classes': 'off',
    'better-tailwindcss/no-duplicate-classes': 'off',
    'better-tailwindcss/no-unknown-classes': 'off',
    'better-tailwindcss/no-unnecessary-whitespace': 'off',
    'e18e/ban-dependencies': 'off',
    'no-console': 'off',
  },
})

export default config
