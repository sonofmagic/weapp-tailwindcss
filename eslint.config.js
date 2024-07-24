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
    ],
  },
  {

  },

)
