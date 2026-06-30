import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

export default defineNuxtConfig({
  css: [
    '~/assets/css/tailwind.css',
  ],
  vite: {
    plugins: [
      ...(
        WeappTailwindcss({
          generator: {
            target: 'web',
            webCompat: {
              preset: 'legacy-web',
            },
          },
        }) ?? []
      ),
    ],
  },
})
