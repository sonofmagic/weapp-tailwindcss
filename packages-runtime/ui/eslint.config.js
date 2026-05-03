import { fileURLToPath } from 'node:url'

import { icebreaker } from '@icebreakers/eslint-config'

const cwd = fileURLToPath(new URL('.', import.meta.url))
const entryPoint = fileURLToPath(new URL('src/index.css', import.meta.url))

export default icebreaker(
  {
    vue: false,
    typescript: true,
    tailwindcss: {
      cwd,
      entryPoint,
    },
    ignores: ['**/fixtures/**', '**/*.md', '**/*.mdx', '**/scripts/**', '**/storybook-static/**', '**/test/**'],
  },
  {
    rules: {
      'better-tailwindcss/no-unknown-classes': 'off',
      'ts/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
).append({
  rules: {
    // stories 中的 class 顺序不影响功能。
    'better-tailwindcss/enforce-canonical-classes': 'off',
    'better-tailwindcss/enforce-consistent-class-order': 'off',
    'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
    'better-tailwindcss/no-conflicting-classes': 'off',
    'better-tailwindcss/no-deprecated-classes': 'off',
    'better-tailwindcss/no-duplicate-classes': 'off',
    'better-tailwindcss/no-unnecessary-whitespace': 'off',
  },
})
