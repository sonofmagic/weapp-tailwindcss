# Package Guidelines (`packages/weapp-tw`)

## 适用范围

- 本文件适用于 `packages/weapp-tw`。
- 当前该包仍是轻量模板/占位实现，变更应以“明确定位”为前提。

## 变更原则

- 在包定位未明确前，避免引入复杂业务逻辑或跨包耦合。
- 若从占位实现升级为正式功能包，需先补 README 与测试矩阵，再扩展 API。
- 导出面变更需同步更新版本策略与消费方预期（避免无说明破坏）。

## 推荐验证命令

- `pnpm --filter weapp-tw test`
- `pnpm --filter weapp-tw build`
