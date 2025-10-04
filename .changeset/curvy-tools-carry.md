---
"theme-transition": major
---
- restructure `useToggleTheme` to expose `capabilities`/`environment` metadata alongside `toggleTheme`, replacing the previous return signature
- add a default export for the Tailwind plugin to align with Tailwind CSS v4 `@plugin` usage while keeping the named export for Tailwind CSS v3
- document the new API surface and widen tests to cover the additional behaviour
