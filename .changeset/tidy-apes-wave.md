---
"weapp-tailwindcss": patch
---

修复 webpack（Taro/uni）增量热更新下的类名转译一致性问题，并确保 JS 仅按最新 class set 精确匹配：

- webpack 资产处理阶段每轮强制收集 runtime class set，避免 script-only 热更新时复用过期集合导致 `bg-[#xxxx]` 一类类名漏转译或截断。
- webpack 模式下 `staleClassNameFallback` 回到默认关闭，保持 JS 转译“只命中 class set”的精确策略。
- 增强 watch-hmr 回归：新增 `bg-[#hex]` 防截断断言（禁止出现 `bg- xxxx`），并纳入 `apps/taro-webpack-tailwindcss-v4` 的脚本热更新用例，确保 e2e:watch 覆盖该场景。
