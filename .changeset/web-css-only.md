---
"weapp-tailwindcss": minor
---

将 `weapp-tailwindcss/vite/web` 拆分为真正的 Generic Web CSS-only 管线：默认只处理 CSS 生成与 HMR，不注册 JS/template、框架扩展、分包和小程序收尾；主入口识别为 Generic Web 后复用相同 profile，`styleInjector` 改为显式 opt-in。
