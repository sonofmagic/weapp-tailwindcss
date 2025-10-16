---
weapp-tailwindcss: minor
tailwindcss-config: patch
---

Add a cross-file JS module graph that follows import and re-export chains so transitive literals are transformed in one pass, and let consumers opt-in via new handler options. Align `tailwindcss-config` with shared utilities for consistency.
