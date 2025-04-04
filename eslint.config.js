import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker(
  {
    tailwindcss: true,
    markdown: true,
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
    ],
  },
  {
    rules: {
      'ts/no-require-imports': 'warn',
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
  },
  {
    files: ['packages/merge/**/*.test.ts'],
    rules: {

    },
  },
)
