---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1254
baseline: ad6e09cbc95bb6094d63ce2d616733cbf0e85cd0
regressions:
  - benchmark/performance/demo/test/evidence.test.mjs
  - benchmark/performance/demo/test/style-evidence.test.mjs
  - benchmark/performance/demo/test/process.test.mjs
---

# 发布版性能对照的隔离与失败证据

## 症状

构建命令成功不代表静态组与接入组等价。首轮 React Vite Web 对照遇到计算颜色不同；SFC 处理曾把嵌套模板和构建缓存当成源码。云端长安装任务中断后，日志已包含多轮测量，但报告仍停留在零样本的初始状态。

## 根因与纠正

- 独立消费项目不能照搬 workspace peer 快照，否则无关框架的可选 peer 会进入安装成本。固定共有直接依赖后独立解析，保存每组完整锁文件；发布包必须在消费目录内真实解析，校验版本及 integrity。
- 静态 CSS 必须使用被测发布版的 Web 兼容转换；仅使用生成器 CSS 会遗漏接入链路的转换。修正后重新生成全部操作状态，再执行计时验证。
- SFC 使用真实解析器定位模板、脚本和样式边界。静态扫描排除捕获构建生成的缓存，不能将缓存重放到其他对照组。
- Gulp 的真实捕获构建发现 `.cost/module.cjs` 被识别为包名；相对导入必须使用 `./.cost/module.cjs`。补充 POSIX、Windows 盘符和跨根目录回归，不能仅按字符串是否以点号开头判断。
- SCSS 中的 `@reference`／`@apply` 需要先通过消费项目的 Sass，再交给被测发布版生成器；静态输出仍需通过框架预处理器的语法验证。
- 保存到页面就绪必须同时核对本轮 marker、实际消费类名和计算样式；HMR 握手与文档重载单独记录。修改计划在计时前准备，实际原子保存仍计时。
- 每个样本在计时结束后保存报告，使用原子替换防止中断留下截断 JSON。合并明确标记中断；语义不稳定或版本错误的行显示 N/A，不进入开销排名。
- npm 解析失败或计划丢失时仍生成预期清单与失败报告，不重新解析 latest 冒充同一次实验。

## 验证

定向回归入口为 `pnpm test:perf:demo`，复用清单和产物检查的兼容回归为 `pnpm test:demo:matrix`。React Vite Web 在上述 baseline 提交已完成正常采样数的三组构建、启动和连续热更新，重新生成静态输入后语义验证通过。原始报告保留在本次任务的 `.tmp/demo-cost/formal-vite-committed`；本机结果不视为云端全矩阵验收，也不冻结预算。

## 适用边界

当前 React Vite Web 有正常采样数的定向实测证据；Gulp 的三组构建、启动与全部更新操作通过缩减采样诊断，另有 7 轮离线安装数据。完整 CLI 云端矩阵仍在验收，其他构建器及 style-injector 必须通过真实结果确认。IDE 和设备验收独立于云端 CLI；本记录不证明这些环境通过。尚未据此修改生产实现，也不能把单一 Vite 目标的模块加载 profile 外推为全仓根因。

## 规则评估

不新增 AGENTS 规则。现有发布依赖隔离、真实语义验证、失败证据和显式预算更新要求已经覆盖这些问题，优先通过持久回归落实。
