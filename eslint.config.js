import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker(
  {
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
      'e2e/__snapshots__/**/*',
      'templates/**',
    ],
    pnpm: false,
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
    files: ['packages-runtime/merge/**/*.test.ts'],
    rules: {

    },
  },
  {
    files: ['pnpm-workspace.yaml'],
    rules: {
      'pnpm/yaml-no-duplicate-catalog-item': ['error', { checkDuplicates: 'exact-version' }],
    },
  },
)
