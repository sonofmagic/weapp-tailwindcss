# weapp-tailwindcss

> English | [简体中文](./README.md)

This is the core package that brings Tailwind CSS to mini program ecosystems, handling class transformation, CSS compatibility, framework build adapters, and Tailwind v4 support.

## Website

For setup guides, configuration references, and framework examples, see the [official weapp-tailwindcss documentation](https://tw.icebreaker.top).

## CLI

The CLI is published separately as `@weapp-tailwindcss/cli`. Install it together with this package and Tailwind CSS:

```bash
pnpm add -D @weapp-tailwindcss/cli weapp-tailwindcss tailwindcss
```

`weapp-tw` provides Tailwind CSS CLI-compatible Web builds, watch mode, source maps, and `canonicalize` by default. Pass `--target weapp` explicitly for CSS-only mini-program compatibility output. Complete WXML/JS/WXSS projects should continue to use a bundler integration. See the [CLI guide](https://tw.icebreaker.top/en/docs/tools/weapp-tw-cli).

The independent CLI reuses this package's Tailwind v4 generator, design system, and source graph. It neither depends on nor invokes `@tailwindcss/cli`. Watch mode uses cross-platform polling and does not depend on `@parcel/watcher`.

For Tailwind CSS 4 projects, the entry CSS must still be imported by the application. Configure `cssEntries` explicitly with absolute paths resolved from the project root, but do not treat it as a replacement for importing the CSS entry into the build graph.

## Runtime requirements

Starting with `weapp-tailwindcss@5.2.0`, Node.js `>=22.12.0` is required. This is the first Node.js 22 release where loading ESM from CommonJS is enabled by default.

When using `uni-app` or `uni-app x` through HBuilderX, HBuilderX `>=5.11` is also required. Older HBuilderX releases may bundle a Node.js runtime that cannot load the current ESM dependencies.
