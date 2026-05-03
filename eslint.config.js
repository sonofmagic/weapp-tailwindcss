import { icebreaker } from '@icebreakers/eslint-config'

const config = icebreaker(
  {
    tailwindcss: false,
    markdown: false,
    ignores: [
      '**/fixtures/**',
      // 'apps',
      'demo',
      'demo-linked',
      'how-to-build-components-by-tailwindcss',
      'packages/tailwindcss-core-plugins-extractor/src',
      // tmp 添加
      'apps/weapp-library',
      'packages/tailwindcss-injector/*.md',
      'packages/weapp-tailwindcss/*.css',
      'e2e/__snapshots__/**/*',
      'templates/**',
      // 排除文档和quest文件
      '.qoder/**/*.md',
      'packages-runtime/ui/**/*.md',
      // 排除 markdown、单元测试、benchmark、skills 引用等非核心文件
      '**/*.md',
      '**/test/**',
      '**/test-*/**',
      'benchmark/**',
      '.claude/**',
      '.agents/**',
      '**/.agents/**',
      '.codex/**',
      'skills/**',
      // 忽略 apps 中生成的 CSS 和类型声明
      'apps/**/result.css',
      'apps/**/result.json',
      'apps/**/transformed.css',
      'apps/**/env.d.ts',
      'apps/tailwindcss-weapp/src/env.d.ts',
      '**/*.d.ts',
      // 忽略 apps 中的 demo 配置文件（非核心代码）
      'apps/taro-webpack-tailwindcss-v4/**',
      'apps/vite-native-ts-skyline/**',
    ],
    pnpm: false,
  },
  {
    rules: {
      'ts/no-require-imports': 'off',
      'ts/no-use-before-define': 'off',
    },
  },
  {
    files: [
      'packages/debug-uni-app-x/**',
      'packages/weapp-tailwindcss/bin/**',
    ],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['apps/**/*.{ts,js}', 'demo/**/*.{ts,js}'],
    languageOptions: {
      globals: {
        wx: true,
        App: true,
        Page: true,
        getApp: true,
        Component: true,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['packages-runtime/merge/**/*.test.ts'],
    rules: {

    },
  },
  // {
  //   files: ['pnpm-workspace.yaml'],
  //   rules: {
  //     'pnpm/yaml-no-duplicate-catalog-item': ['error', { checkDuplicates: 'exact-version' }],
  //   },
  // },
)

export default config.append({
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
    'ts/no-use-before-define': 'off',
  },
})
