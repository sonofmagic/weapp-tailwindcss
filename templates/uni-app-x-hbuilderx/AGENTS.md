# Repository Guidelines

## Project Structure & Module Organization
This repository is a small `uni-app x` template intended for development in `HBuilderX`. App entry files live at the root: `App.uvue`, `main.uts`, `pages.json`, `manifest.json`, and `platformConfig.json`. Page views are under `pages/`, reusable UI lives in `components/`, shared state is in `stores/`, and static assets are in `static/`. Styling is configured through [`tailwind.config.js`](/Users/yangqiming/Documents/GitHub/uni-app-x-hbuilderx/tailwind.config.js) and [`uni.scss`](/Users/yangqiming/Documents/GitHub/uni-app-x-hbuilderx/uni.scss). Build integration for Tailwind and uni-app is in [`vite.config.ts`](/Users/yangqiming/Documents/GitHub/uni-app-x-hbuilderx/vite.config.ts).

## Build, Test, and Development Commands
Use `pnpm` with Node.js `20.19+`.

- `pnpm install`: installs dependencies and runs `weapp-tw patch` via `postinstall`.
- `pnpm exec hbuilderx-cli --help`: verifies the local HBuilderX CLI is available.
- `pnpm exec weapp-tw patch`: reapplies the weapp-tailwindcss patch if dependencies or generated files drift.

Day-to-day development is expected to happen by importing the project into `HBuilderX` and running it there.

## Coding Style & Naming Conventions
Follow the existing file-local style. `uvue` files currently use tabs in templates/scripts, while `uts` files use 2-space indentation. Keep imports grouped at the top, prefer `<script setup lang="uts">` for page components, and name components in PascalCase like `WeappTailwindcss.uvue`. Keep store modules lowercase and descriptive, for example `stores/counter.uts`. When adding Tailwind classes, make sure new `uts` or `uvue` paths are covered by `tailwind.config.js`.

## Testing Guidelines
No automated test runner, coverage gate, or lint script is committed in this template. Validate changes by running the app in `HBuilderX` and checking the affected target platform manually. For new tests, place them close to the feature they cover and use a name that mirrors the source file, for example `counter.test.uts`.

## Commit & Pull Request Guidelines
Recent history uses short Conventional Commit prefixes such as `chore:` and `chore(deps):`. Keep that pattern and write imperative summaries, for example `fix: update theme change cleanup`. Pull requests should describe the user-visible change, list the target platform(s) tested, and attach screenshots or recordings for UI updates. Link related issues when applicable.

## Configuration Notes
If you add new page, component, or utility directories, update Tailwind `content` globs so class extraction continues to work. Do not commit local HBuilderX-generated artifacts unless they are required for the template itself.

## Agent-Specific Instructions
This repository includes a local skill at `.agents/skills/uniappx-project`. Use it first when working on `uni-app x` built-in components, platform APIs, compatibility checks, and conditional compilation. Treat the official `uni-app x` examples and compatibility notes referenced by that skill as the source of truth before introducing new patterns or abstractions.
