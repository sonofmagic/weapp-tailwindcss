import { defineConfig } from "vite";
import process from 'node:process'

const isH5 = process.env.UNI_PLATFORM === 'h5'
const isApp = process.env.UNI_PLATFORM === 'app'
const WeappTailwindcssDisabled = isH5 || isApp
import uni from "@dcloudio/vite-plugin-uni";
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import tailwindcss from '@tailwindcss/postcss'
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // 改成 mts，则爆 uni is not a function
    uni(),
    UnifiedViteWeappTailwindcssPlugin(
      {
        rem2rpx: true,
        disabled: WeappTailwindcssDisabled,
        cssEntries: [
          path.resolve(__dirname, 'src/main.css')
        ]
      }
    )
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss()
      ]
    }
  }
});
