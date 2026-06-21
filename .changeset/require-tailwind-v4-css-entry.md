---
"weapp-tailwindcss": major
---

Tailwind CSS v4 入口现在必须来自独立的 `.css` 文件，例如在 `app.css` 中写入 `@import "tailwindcss";`。不再支持把 Tailwind v4 根入口写在 `.scss`、`.less` 等预处理器文件或 Vue SFC 的 `<style>` 块中，也不再消费 inline `tailwindcss.v4.css` 作为根入口。
