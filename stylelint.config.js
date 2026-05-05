import { icebreaker } from '@icebreakers/stylelint-config'

export default icebreaker({
  ignoreFiles: [
    'e2e/__snapshots__/**',
    'packages/weapp-tailwindcss/test/fixtures/css/**',
    'packages/weapp-tailwindcss/*.css',
    'packages/postcss/**/*.wxss',
  ],
})
