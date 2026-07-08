---
"weapp-tailwindcss": patch
---

修复 Vite Web/H5 开发态中 Tailwind CSS 类名热更新不刷新样式的问题。

此前在 uni-app H5 等场景中，从 Vue script、Vue template 或 JS/TSX 中修改 `bg-[#0000ff]` 这类 Tailwind 类名后，补发的 Vite CSS HMR 更新会走 `css-update`，但 Vite 开发态 CSS module 实际通过 JS 重新导入更新页面内的 `<style>` 标签，导致浏览器样式没有生效。现在补发更新改为 `js-update`，并补充 Web/H5 真实 DOM 热更新矩阵回归，覆盖 uni-app、Taro React 与 Taro Vue 的模板、脚本和 TSX 类名修改。
