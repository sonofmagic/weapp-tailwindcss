---
name: weapp-tailwindcss
description: 协调 weapp-tailwindcss 相关任务并提供当前安全基线。Use when 用户泛化地询问 weapp-tailwindcss、Tailwind CSS in mini-programs、mini app styling，或尚未明确是接入、迁移、排障、运行时、自定义构建还是 React Native；具体任务优先路由到对应专用 skill。
---

# weapp-tailwindcss

将泛化请求路由到专用 skill，并在专用 skill 未安装时提供不会破坏当前 v5 构建边界的最小兜底。

## 路由任务

1. 先识别任务类型、框架、构建器、目标端和当前版本。
2. 按下表优先使用专用 skill：

| 任务 | Skill |
| --- | --- |
| 新接入、框架配置、多端配置 | `$weapp-tailwindcss-setup` |
| 旧项目升级、v4 到 v5 | `$weapp-tailwindcss-migrate` |
| 样式缺失、转译、HMR、运行端异常 | `$weapp-tailwindcss-troubleshoot` |
| 动态 class、merge、cva、variants | `$weapp-tailwindcss-runtime` |
| Core API、自研构建器、样式注入 | `$weapp-tailwindcss-custom-build` |
| Expo、Metro、React Native | `$weapp-tailwindcss-react-native` |

3. 专用 skill 不可用时，读取 [references/safety-baseline.md](references/safety-baseline.md)，先给出安全基线和需要补充的信息，不猜测框架配置。
4. 涉及多个任务时，按“迁移或接入 -> 排障 -> 运行时优化”排序处理。

## 不可破坏的边界

- 当前文档与主线只维护 Tailwind CSS 4。
- 受 `weapp-tailwindcss` 管理的同一次构建中，Tailwind 生成由 `WeappTailwindcss` 接管；不要再叠加 Tailwind 官方生成插件。
- Tailwind CSS 入口使用纯 `.css`，必须被项目实际引入；`cssEntries` 只提供入口语义，不能替代构建图导入。
- `cssEntries` 使用由项目根目录解析出的绝对路径。
- H5/Web 通常保留插件并由 generator 自动选择 `web` target，不要默认用 `disabled` 跳过。
- JavaScript class 转译依赖 Tailwind 验证过的 `classNameSet` 精确命中，不使用启发式转译兜底。

## 输出要求

- 先给结论与适用环境，再列修改文件、配置、命令和验证标准。
- 清楚区分源码、构建产物和真实运行时证据。
- 对不确定的版本或框架行为，先读取项目 manifest、现有配置和官方文档，不输出记忆中的旧示例。

