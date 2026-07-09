import path from "node:path";
import { fileURLToPath } from "node:url";
import uni from "@dcloudio/vite-plugin-uni";
import { defineConfig } from "vite";
import { WeappTailwindcss } from "weapp-tailwindcss/vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    uni(),
    WeappTailwindcss({
      appType: "uni-app-vite",
      tailwindcssBasedir: projectRoot,
      cssEntries: [
        path.resolve(projectRoot, "src/styles/tailwindcss.css"),
      ],
      cssOptions: {
        rem2rpx: true,
      },
      styleInjector: false,
      customAttributes: {
        "*": [/^t-class(?:-.+)?$/],
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api", "import", "color-functions"],
      },
    },
  },
});
