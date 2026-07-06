# Tailwind CSS v4 Plugin Benchmark

This workspace package compares `weapp-tailwindcss`, `@tailwindcss/postcss`, and `@tailwindcss/vite` under the same generated Tailwind CSS v4 input.

The benchmark is intentionally isolated. Official Tailwind plugins are installed and used only inside this benchmark package, not in normal demo/app build configuration.

## Commands

```bash
pnpm run bench:tailwindcss-plugin
pnpm run bench:tailwindcss-plugin -- --runs 3 --warmups 1
pnpm run bench:tailwindcss-plugin:report
```

Default outputs:

- `benchmark/tailwindcss-plugin-compare/data/latest.json`
- `benchmark/tailwindcss-plugin-compare/report.md`

## Parameters

- `--runs`: measured iterations per case. Default: `5`.
- `--warmups`: warmup iterations before measurement. Default: `1`.
- `--class-count`: generated Tailwind candidate count. Default: `600`.
- `--source-files`: generated source file count. Default: `12`.
- `--out`: JSON output path.
- `--report`: Markdown report path.
- `--keep-temp`: keep the temporary fixture directory for inspection.

## Cases

Generation core:

- `weapp-tailwindcss/generator` with `target=weapp`, `scanSources=true`.
- `weapp-tailwindcss/generator` with `target=web`, `scanSources=true`.
- `weapp-tailwindcss/generator` with `target=weapp`, `scanSources=false`, explicit candidates.
- `weapp-tailwindcss/generator` with `target=web`, `scanSources=false`, explicit candidates.
- `weapp-tailwindcss/generator` incremental cache cold, hit, and append paths.
- `@tailwindcss/postcss` through direct `postcss([tailwindcss()]).process(...)`.

Full Vite build:

- Vite with `@tailwindcss/postcss` through `css.postcss.plugins`.
- Vite with `@tailwindcss/vite`.
- Vite with `weapp-tailwindcss/vite` and `generator.target='weapp'`.
- Vite with `weapp-tailwindcss/vite` and `generator.target='web'`.

## Reading Results

Generation core cases isolate CSS generation cost and are the preferred comparison for plugin generation behavior. Vite build cases include bundler startup, Rollup output, and plugin integration overhead, so use them as end-to-end reference rather than pure generator timing.
