import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker(
  {
    tailwindcss: {
      tailwindConfig: './tailwind.config.ts',
    },
    react: false,
    markdown: false,
  },
)
