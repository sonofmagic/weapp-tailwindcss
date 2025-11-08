---
"weapp-tailwindcss": patch
---

`weapp-tw patch` 在执行前会自动删除 `tailwindcss-patch` 的缓存目录（通常为 `node_modules/.cache/tailwindcss-patch`），避免残留缓存导致补丁失效或读取到旧版本产物。
