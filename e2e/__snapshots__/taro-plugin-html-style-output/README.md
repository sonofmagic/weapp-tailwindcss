# Taro Plugin HTML Style Output

## Core Report

对 4 个 Taro demo 分别执行 `with-plugin-html` 与 `without-plugin-html` 的 `build:weapp`，样式产物按项目和模式保存到子目录。

| Project | With plugin-html | Without plugin-html | Same hashes | Changed files |
| --- | --- | --- | --- | ---: |
| [taro-webpack-react-tailwindcss-v4](taro-webpack-react-tailwindcss-v4/README.md) | passed | passed | false | 1 |
| [taro-vite-react-tailwindcss-v4](taro-vite-react-tailwindcss-v4/README.md) | passed | passed | true | 0 |
| [taro-webpack-vue3-tailwindcss-v4](taro-webpack-vue3-tailwindcss-v4/README.md) | passed | passed | false | 1 |
| [taro-vite-vue3-tailwindcss-v4](taro-vite-vue3-tailwindcss-v4/README.md) | passed | passed | true | 0 |

## File Index

- 每个项目目录下的 `README.md` 是该项目核心对比报告。
- 完整样式产物在 `with-plugin-html/artifacts/` 与 `without-plugin-html/artifacts/`。
- 结构化结果在 `report.json`。
