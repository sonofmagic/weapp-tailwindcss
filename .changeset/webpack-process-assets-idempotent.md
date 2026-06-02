---
"weapp-tailwindcss": patch
---

优化 Webpack `processAssets` 阶段的产物写回逻辑：当转换结果与当前 asset 内容一致时，不再调用 `updateAsset`，也不触发 `onUpdate`。这可以减少同一轮 asset processing 中的重复写回，并降低 watch 场景下的无效产物变更。
