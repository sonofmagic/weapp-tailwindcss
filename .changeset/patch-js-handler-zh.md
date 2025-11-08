---
weapp-tailwindcss: patch
---

修复 JS handler 在标记 weappTwIgnore 模板后仍会误转译后续相同字面量的问题，确保仅跳过被 weappTwIgnore 包裹的模板，其它位置仍按运行时类集正常转译。
