import type { Config } from 'tailwindcss'

export default <Config>{
  content: ['./miniprogram/sub-independent/**/*.{wxml,html,js,ts,jsx,tsx,vue,mpx}'],
  theme: {
    extend: {
      colors: {
        'independent-subpackage-marker': '#dc2626',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
}
