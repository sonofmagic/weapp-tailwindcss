---
"weapp-tailwindcss": patch
---

fix js stale fallback false positives for source-location literals in logs/stack traces.

- hard reject source-location tokens like `App.vue:4`, `index.ts:120:3`, `Foo.jsx:8`
- add default fallback excludes for source location, URL, and file paths
- add configurable `fallbackExcludePatterns` and `fallbackCandidateFilter`
- add regression tests for stale fallback true/false and keep tailwind candidate escaping
