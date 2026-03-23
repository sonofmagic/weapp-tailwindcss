import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker(
  {
    vue: false,
    typescript: true,
    tailwindcss: {
      entryPoint: 'src/index.css',
    },
    ignores: ['**/fixtures/**', '**/*.md', '**/scripts/**', '**/test/**'],
  },
  {
    rules: {
      'better-tailwindcss/no-unknown-classes': 'off',
      'ts/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
).overrideRules({
  // 降级 better-tailwindcss 规则为 warn（stories 中的 class 顺序不影响功能）
  'better-tailwindcss/enforce-consistent-class-order': 'warn',
  'better-tailwindcss/enforce-consistent-line-wrapping': 'warn',
})
