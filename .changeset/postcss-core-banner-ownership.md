---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

将公开 core 编译入口的 Tailwind banner 注释清理迁入 PostCSS 包，直接复用已有 AST，保留目标平台、finalize 开关、其它版权注释和声明字面量的既有行为。
