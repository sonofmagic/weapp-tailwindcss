---
"weapp-tailwindcss": patch
---

调整 Vite 构建态的 Tailwind CSS 生成时机，使生成结果继续经过框架原有的 PostCSS 流程，并避免最终产物阶段重复生成同一份样式。
