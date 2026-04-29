---
"theme-transition": patch
---

将反向 clip-path 关键帧生成逻辑从 `Array.prototype.toReversed` 改为兼容性更高的数组复制后反转写法，避免在较低 `lib` 目标的 TypeScript 检查中报错。
