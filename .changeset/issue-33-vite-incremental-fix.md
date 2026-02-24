---
"weapp-tailwindcss": patch
---

修复 Vite 开发增量构建中，clean JS 产物未回填缓存导致 `<script>` 任意值类名（如 `bg-[#000]`、`px-[432.43px]`）偶发失效的问题。

同时补充 issue #33 回归测试，复用 watch-hmr 体系覆盖 script/template 任意值在 add/modify/delete 三阶段的增量行为，并增加调试日志用于定位 dirty 文件、token 命中与缓存跳过决策。

增强 watch-hmr 回归鲁棒性（CRLF/LF 写回一致性、短暂 ENOENT 重试、Windows 进程树退出）并在 e2e-watch 工作流加入 issue33 专项三平台矩阵与失败 artifacts（json/snapshots/failures）。
