---
"weapp-tailwindcss": patch
---

修复 Vite 开发增量构建中，clean JS 产物未回填缓存导致 `<script>` 任意值类名（如 `bg-[#000]`、`px-[432.43px]`）偶发失效的问题。

同时补充 issue #33 回归测试，覆盖 script/template 任意值在 add/modify/delete 三阶段的增量行为，并增加调试日志用于定位 dirty 文件、缓存命中与跳过决策。
