# Repository Guidelines

## Project Structure & Module Organization
The monorepo uses pnpm workspaces and Turbo. Core libraries live under `packages/`, with supporting crates in `crates/` for performance-sensitive utilities. Mini-program demos and integration samples reside in `apps/` and `demo/`; the `website/` directory serves the docs site. End-to-end fixtures are tracked in `e2e/`, while shared assets and benchmarks sit in `assets/` and `benchmark/`. Automation scripts are under `scripts/` and `tailwindcss-weapp/` contains legacy v1 sources kept for reference.

## Build, Test, and Development Commands
Run `pnpm install` (Node ≥18) before anything else. Use `pnpm build` for a full Turbo pipeline across the repo, or scope builds with `pnpm build:apps` and `pnpm build:pkg`. During iteration, `pnpm run:watch` keeps package outputs fresh. Execute unit tests via `pnpm test` and targeted suites with commands like `pnpm test:core` or `pnpm test:plugins`. End-to-end checks run through `pnpm e2e`, and `pnpm demo:build` prepares distributable demo bundles.

## Coding Style & Naming Conventions
TypeScript and modern ESM are the defaults; keep indentation at two spaces and favour descriptive camelCase for functions while reserving PascalCase for classes and React-style components. Follow Tailwind utility casing when authoring configs. Linting is enforced by `pnpm lint` (ESLint) and style checks by `pnpm format` or `pnpm lint-staged` on pre-commit. CSS modules should align with utility-first naming, and Rust crates adhere to snake_case per Cargo conventions.

## Testing Guidelines
Vitest powers unit, integration, and snapshot coverage; place new suites inside the relevant package’s `__tests__/` or `test/` folder and name files `*.test.ts`. When editing snapshot-heavy plugins, refresh snapshots with `pnpm e2e:u` or `pnpm test -u`. Maintain >80% coverage within critical packages and add regression cases for bug fixes. For e2e scenarios, mirror fixture names after the feature being validated (e.g., `vite-native.test.ts`).

## Commit & Pull Request Guidelines
Commits follow Conventional Commit semantics, enforced by commitlint and the existing history (e.g., `feat: add runtime matcher`). Keep commits scoped to a logical change and run the relevant build/test commands beforehand. Pull requests should include a clear summary, link to issues when available, and attach screenshots or logs for UI or e2e changes. Note any Changeset entries required for package releases and mark breaking changes explicitly.

## Environment & Tooling Notes
Use `pnpm` for all workspace tasks; other package managers are blocked by the `only-allow` hook. Husky manages git hooks, so run `pnpm prepare` after fresh clones. When working on the docs site (`website/`), export environment variables via `.env.local` and run `pnpm build:docs` before publishing.
