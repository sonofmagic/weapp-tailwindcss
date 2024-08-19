import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker(
  {
    markdown: false,
    // mdx: true,
  },
  {
    ignores: [
      '**/fixtures/**',
      // 'apps',
      'demo',
      'demo-linked',
      'how-to-build-components-by-tailwindcss',
      'packages/tailwindcss-core-plugins-extractor/src',
      // tmp 添加
      'apps/weapp-library',
    ],
  },
  {
    files: ['apps/**/*.{ts,js}', 'demo/**/*.{ts,js}'],
    languageOptions: {
      globals: {
        wx: true,
        App: true,
        Page: true,
        getApp: true,
      },
    },
  },
  {
    files: ['**/*.md'],
    rules: {
      'ts/no-unused-vars': 'off',
    },
  },

)
