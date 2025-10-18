import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import { r } from './shared'
import { uniAppX } from 'weapp-tailwindcss/presets'
import tailwindcss from 'tailwindcss'

export default defineConfig({
    plugins: [
        uni(),
        UnifiedViteWeappTailwindcssPlugin(
            uniAppX({
                base: __dirname,
                rem2rpx: true,
            }),
        ),
    ],
    css: {
        postcss: {
            plugins: [
                tailwindcss({
                    config: r('./tailwind.config.js'),
                }),
            ]
        }
    }
});