import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { weappTailwindcss } from 'weapp-tailwindcss/vite'
import { uniAppX } from 'weapp-tailwindcss/presets'

export default defineConfig({
    plugins: [
        uni(),
        weappTailwindcss(
            uniAppX({
                base: __dirname,
                rem2rpx: true,
            }),
        ),
    ],
});
