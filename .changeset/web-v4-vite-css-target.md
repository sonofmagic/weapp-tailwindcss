---
"weapp-tailwindcss": patch
---

Fix Vite web target builds so generated CSS assets are left as Vite web CSS instead of being routed back through mini-program Tailwind generation and CSS post-processing.

Also clean Tailwind v3 legacy compat CSS after repairing unclosed imported rules so raw `@tailwind` and `@apply` directives do not leak into generated mini-program CSS.
