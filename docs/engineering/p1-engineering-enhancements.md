# P1 工程增强实现说明

本阶段在 P0 诊断事件和性能报告基础上，增加构建器能力契约、分层缓存遥测、支持矩阵、Issue 证据和变更影响检查。

`compiler/capabilities` 定义构建器无关接口；`compiler/cache-telemetry` 记录缓存层、命中、失效、淘汰、内存估算和 revision。`scripts/p1-support-matrix.mjs`、`scripts/p1-evidence-check.mjs` 与 `scripts/p1-impact-check.mjs` 均为可重复的报告/校验入口，不自动修改外部系统。
