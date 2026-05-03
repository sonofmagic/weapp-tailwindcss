import { icebreaker } from '@icebreakers/eslint-config'

const config = icebreaker({
  vue: true,
  tailwindcss: false,
})

export default config.append({
  ignores: [
    'src/env.d.ts',
  ],
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
    'ts/no-use-before-define': 'off',
    'vue/no-required-prop-with-default': 'off',
  },
})
