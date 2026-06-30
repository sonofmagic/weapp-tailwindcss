import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
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
})
