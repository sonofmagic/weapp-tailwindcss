---
'weapp-tailwindcss': patch
---

修复 uni-app x Web 端页面与组件局部 Tailwind 样式隔离，确保插槽内容、图片以及显式配置的组件 class 属性能够保留宽高、颜色、间距和 `!important` 优先级。
