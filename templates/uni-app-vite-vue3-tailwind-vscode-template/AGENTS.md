# Repository Guidelines

## Project Structure & Module Organization

This template uses `uni-app + Vite + Vue 3 + Tailwind CSS` with `pnpm`. Application code lives in `src/`. Put route pages under `src/pages/`, shared UI in `src/components/`, and Pinia stores in `src/stores/`. Static files belong in `src/static/`. Global entry files are `src/main.ts`, `src/App.vue`, `src/pages.json`, and `src/manifest.json`. Tooling is defined at the root in [`vite.config.ts`](/Users/yangqiming/Documents/GitHub/uni-app-vite-vue3-tailwind-vscode-template/vite.config.ts), [`tailwind.config.ts`](/Users/yangqiming/Documents/GitHub/uni-app-vite-vue3-tailwind-vscode-template/tailwind.config.ts), and [`eslint.config.mjs`](/Users/yangqiming/Documents/GitHub/uni-app-vite-vue3-tailwind-vscode-template/eslint.config.mjs).

## Build, Test, and Development Commands

Use `pnpm install` to install dependencies; `postinstall` automatically runs `weapp-tw patch`.

- `pnpm dev:mp-weixin`: start WeChat Mini Program development build.
- `pnpm dev:h5`: run the H5 dev server.
- `pnpm build:mp-weixin`: create a production Mini Program build in `dist/build/mp-weixin`.
- `pnpm build:h5`: create an H5 production build.
- `pnpm open:dev`: open the WeChat DevTools against `dist/dev/mp-weixin`.
- `pnpm lint`: run ESLint across the repo.
- `pnpm lint:fix`: auto-fix lint issues in `src/`.

## Coding Style & Naming Conventions

Follow `.editorconfig`: 2-space indentation, LF line endings, UTF-8. Prefer Vue 3 SFCs with TypeScript. Use PascalCase for component filenames such as `HeroShowcase.vue`, camelCase for store and utility modules such as `counter.ts`, and keep page directories route-aligned, for example `src/pages/index/index.vue`. ESLint uses `@icebreakers/eslint-config` with Vue, Tailwind, and WeChat rules; run `pnpm lint` before opening a PR.

## Testing Guidelines

No automated test runner is configured yet. For now, treat `pnpm lint` as the minimum quality gate and verify changes manually in the target platform, usually `pnpm dev:mp-weixin` plus WeChat DevTools. If you add tests, keep them near the feature or under a future `tests/` directory and use `*.spec.ts` naming.

### HMR Verification Notes

When verifying `weapp-tailwindcss` HMR, run `pnpm dev:mp-weixin` in a normal, non-sandboxed shell. Codex/tool sandboxes can prevent the uni-app mini-program watcher from receiving file events, which makes `dist/dev/mp-weixin` appear stale even though the project HMR path is healthy.

For a reliable check, edit a real source SFC such as `src/components/sections/CapabilityShowcase.vue` and verify both template classes and script-side Tailwind class strings. Expected mini-program evidence includes `Incremental Compiling...` in the dev log plus transformed class names in `dist/dev/mp-weixin/**/*.wxml`, `*.js`, and `app.wxss` (for example arbitrary values converted to `*_b_*` selectors). For H5, confirm the Vite `hmr update` log and, when possible, inspect the browser computed style.

## Commit & Pull Request Guidelines

Recent history uses short Conventional Commit style prefixes such as `chore:` and `chore(deps):`. Keep that pattern for new work, for example `feat: add profile page` or `fix: correct tailwind class merge`. PRs should include a concise description, linked issue when applicable, screenshots or DevTools captures for UI changes, and the commands you used to verify the change.

## Configuration Tips

Before shipping, replace the `appid` in `src/manifest.json` with your own. Keep generated output under `dist/` out of source edits, and prefer updating source files rather than editing built artifacts.

Project-level agent skills should stay minimal in this repository. Keep installed skills under `.agents/skills/` and commit `skills-lock.json` for reproducibility. Do not commit compatibility symlink directories such as `.claude/`, `.continue/`, or `skills/` unless this repository explicitly needs those tools.
