---
'tailwindcss-weapp': patch
---

修复 mp-weixin 构建时强制使用内置的 uni-mp-vue 运行时，避免缺失 findComponentPropsData 导致的打包错误。
