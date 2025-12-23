import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker(
  {
    vue: false,
    typescript: true,
    tailwindcss: {
      entryPoint: 'src/index.css',
    },
    ignores: ['**/fixtures/**', '**/*.md', '**/scripts/**'],
  },
  {
    rules: {
      'better-tailwindcss/no-unregistered-classes': 'off',
      'ts/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
)
