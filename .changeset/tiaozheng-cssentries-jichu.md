---
'weapp-tailwindcss': patch
---

修复当 `cssEntries` 指向子目录文件时强制重写 Tailwind v4 `base` 的问题，优先沿用工作区/用户指定根目录并在多包场景下智能分组；补充整合测试确保通过 `getCompilerContext` 仍能识别子目录样式并正确重写 `bg-[#00aa55]` 这类动态类名。
