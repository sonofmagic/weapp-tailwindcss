---
status: partial
issue: https://github.com/weapp-tailwindcss/weapp-tailwindcss/pull/1269
baseline: 43d546478b723392ae9bf990062f55257104e92d
regressions:
  - packages/weapp-tailwindcss/test/watch-hmr-class-variables.unit.test.ts
  - packages/weapp-tailwindcss/test/watch-hmr-class-evidence.unit.test.ts
---

# Watch 样式证据中的根变量与计算阶段

## 症状

uni-app x 微信 watch 在 `baseline-arbitrary add`、seed `000042` 阶段拒绝 `space-y-2.5`，同批其余 9 个 token 已有消费证据。模板实际消费 `wtu-5qg895-1` 和 `data-v-00a60067`；原 utility 使用 `var(--spacing)`，safe class 使用 `8rpx`。已读取 CSS 的无条件主题根规则重复声明相同的 `--spacing:8rpx`，不存在其他覆盖。

两者均包含 `view+view`、`view+text`、`text+view`、`text+text` 四个后代组合；五条声明的顺序和结构相同。原签名只比较变量引用与字面量 AST，因而无法识别这一受限等价关系。实际探针没有 `view/text` 子节点，此处不能声称已经证明可见间距或运行时效果。

## 根因与纠正

通用 CSS 值签名仍由 PostCSS 包维护。只索引本次已读取 CSS 中直接处于无条件根规则的变量；selector 列表必须全部属于已知主题根，且含独立的 `:root`、`html` 或 `page`。局部、条件、layer、keyframes、starting-style、限定根选择器和冲突重定义都将该变量标为不可展开；`@property` 注册同样拒绝，转义名称使用解码后的统一身份。

变量依赖完整解析，未选择的 fallback 也参加循环检查。缺失、局部覆盖、循环、CSS-wide 关键字、无效值、URL、attr、env 和未知函数均保持原签名。依赖深度限制为 64，展开签名大小限制为 65,536；绑定和使用位置都在拼接前检查预算。缓存只属于当前 CSS 快照，替换直接拼接 AST 节点，不把 `var(--number)px` 重新分词成长度。

复查暴露了必须保留的两个语义边界：

- 自定义属性声明保持原始签名，避免 `--local:var(--known,var(--local))` 的 fallback 环被主值替换隐藏。
- 普通属性只有在展开结果仍含真正的未解析 `var()` 时才采用展开签名。两边因此仍在 computed-value 阶段判断声明有效性；完全内联保持原签名，避免把 `color:red;color:var(--spacing)` 与 `color:red;color:8rpx` 误判为相同。

实际间距声明在替换根 spacing 后仍保留相同的 `var(--tw-space-y-reverse)`，满足这一条件。不同残留变量名、fallback、声明、顺序、重要性、选择器和条件仍不能相互匹配。条件参数不展开变量。此功能只是受限的静态等价证明，不是通用 CSS 求值器。

## 验证

- 实现前的第一批变量用例有 8 项正例失败；复查追加的局部 fallback 环和无效变量值负例也分别在修正前失败，确认不是放宽断言掩盖问题。
- `CI=1 pnpm --filter weapp-tailwindcss exec vitest run test/watch-hmr-class-variables.unit.test.ts test/watch-hmr-class-evidence.unit.test.ts test/watch-hmr-class-baseline.unit.test.ts test/watch-hmr-regression.unit.test.ts test/watch-hmr-runner.unit.test.ts test/watch-hmr-style-only.unit.test.ts test/watch-hmr-comment-carrier.unit.test.ts --update=none`：7 文件、230 项通过，无跳过；其中新变量回归 55 项。
- 通过现有 `readJoinedOutputFiles` 只读加载失败现场的 `app.wxss` 与页面 WXSS，再调用现有 class 消费断言：seed `000042` 的 10 个 token 全部通过，`space-y-2.5` 对应 `wtu-5qg895-1`。未重建、修改或重启失败现场。
- 改动的 3 个 TypeScript 文件通过 ESLint，显式关闭 `format/prettier`；`pnpm --filter weapp-tailwindcss exec tsc -p tsconfig.typecheck.json --pretty false`、`pnpm architecture:check` 通过。
- 对两个改动的 CSS 源模块，通过 TypeScript API 启用 strict、exactOptionalPropertyTypes、noUncheckedIndexedAccess，逐文件取得语法和语义诊断，均为零。额外直接命令检查完整传递依赖图仍遇到未改动的 PostCSS 类型错误，涉及 cascade-layers、predicates、preset-env 等；不能据此宣称 PostCSS 全包 strict 类型检查通过。
- 独立只读复查确认上述误等价和展开预算问题已修正。`git diff --check` 与 `pnpm agents:check` 在提交前执行。

## 适用边界

本次没有操作设备、IDE、浏览器或真实 watch，也没有重跑全面流程。保存产物静态断言通过不代表 HMR 完成，真实链路仍需由主流程在新预检后验证。

没有修改 demo、样式生成、产物内容或 static 预期，因而不更新 static 基线。签名模块只被工程 watch 证据读取器按源码路径消费，未通过 PostCSS 包公开入口导出；本次不增加公开包 change intent 或版本提升。

## 规则评估

不新增 AGENTS。现有 CSS 解析所有权、先固化反例、保持完整证据和不得用静态结果替代运行时验收的规则已覆盖本次修复。
