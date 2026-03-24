---
"weapp-tailwindcss": patch
---

修复 `uni-app x` 在 `HBuilderX` 小程序运行场景下的 Tailwind 目标绑定问题，并收敛 preset 默认配置：

- `uniAppX` preset 现在会自动补齐 `resolve.paths`，并根据当前工程已安装的 Tailwind 版本推断默认 patcher 配置
- 修复显式 `tailwindcss@3` 工程被 `v4` 配置对象误判的问题，避免运行时类名集合绑定到错误的 Tailwind 目标
- `demo/uni-app-x-hbuilderx-tailwindcss3` 可在更少用户配置下直接运行到微信小程序端，并正确转译 `text-[50px]`、`border-[#ff0000]` 等动态类名
