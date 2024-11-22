import type { Config } from 'tailwindcss'
import { themeTransitionPlugin } from 'theme-transition/tailwindcss'

export default <Config> {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './docusaurus.config.ts',
    'docs/**/*.{md,mdx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {},
  },
  plugins: [themeTransitionPlugin()],
  corePlugins: {
    preflight: false,
  },
}
