import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // 改成 mts，则爆 uni is not a function
    uni(),
    WeappTailwindcss(
      {
        rem2rpx: true,
      }
    )
  ],
});
