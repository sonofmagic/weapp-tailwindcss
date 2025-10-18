import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import tailwindcss from '@tailwindcss/postcss'
import path from 'path'
export default defineConfig({
    plugins: [
        uni(),
        UnifiedViteWeappTailwindcssPlugin(
            {
                rem2rpx: true,
                tailwindcss: {
                    v4: {
                        base: __dirname,
                        cssEntries: path.resolve(__dirname, 'main.css')
                    }
                }
            }
        )
    ],
    css: {
        postcss: {
            plugins: [
                tailwindcss({
                    base: __dirname
                })
            ]
        }
    }
});