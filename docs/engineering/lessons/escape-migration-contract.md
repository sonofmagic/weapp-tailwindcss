---
status: verified
issue: https://github.com/sonofmagic/weapp-core/tree/abfdcce3a2486879524e8e593ea34ee73ef7f6a3/packages/escape
baseline: bc42340685067d13e0ddc665197662848faaacfa
regressions:
  - packages/escape/test/published-compat.test.ts
---

# escape 迁移中的既有契约

## 症状

首次 tarball 检查假定默认 `unescape(escape('hover:bg-red-500'))` 返回原字符串，实际保留了符号转义片段。源码与 npm 8.0.0 的对照测试一致，失败来自新检查对旧 API 的错误假设。

## 根因与纠正

8.0.0 的默认 unescape 路径不负责还原全部符号映射；显式传入 map 才进入映射反转路径。现有 runtime 已把同一映射传给两端。迁移保持九个源码文件逐字节不变，修正示例和 tarball 检查以共享 `MappingChars2String`，发布版对照继续覆盖默认与自定义选项。

## 验证

`pnpm --filter @weapp-tailwindcss/escape test` 的 120 项测试通过；`pnpm --filter @weapp-tailwindcss/escape test:package` 的 ESM/CJS、双端声明和消费者依赖范围检查通过。完整命令与定向回归记录见[迁移记录](../../../packages/escape/MIGRATION.md)。

## 适用边界

此结论适用于 npm 8.0.0 及本次无行为变化的源码迁移，不承诺任意输入或任意自定义映射都可逆。未来修改转换语义应独立设计与发布，不能以修复迁移验收的名义混入。

## 规则评估

保留既有根规则，新增基础包 AGENTS 说明调用关系、构建产物与发布边界；不新增全仓通用约束。
