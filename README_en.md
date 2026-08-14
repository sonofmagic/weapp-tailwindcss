<p align="center">
  <a href="https://tw.icebreaker.top">
    <img src="./assets/logo.png" alt="weapp-tailwindcss logo" width="128">
  </a>
</p>

<h1 align="center">weapp-tailwindcss</h1>

<p align="center">
  <strong>Bring Tailwind CSS to every platform!</strong>
</p>

<p align="center">
  <a href="./README.md">简体中文</a> | English
</p>

<p align="center">
  <a href="https://tw.icebreaker.top">Website</a> ·
  <a href="https://tw.icebreaker.top/docs/intro">Docs</a> ·
  <a href="https://tw.icebreaker.top/docs/quick-start/install">Quick Start</a> ·
  <a href="https://tw.icebreaker.top/docs/tools/weapp-tw-cli">CLI</a> ·
  <a href="https://github.com/sonofmagic/weapp-tailwindcss/tree/main/demo">Examples</a>
</p>

<p align="center">
  <a href="https://github.com/sonofmagic/weapp-tailwindcss/stargazers"><img src="https://badgen.net/github/stars/sonofmagic/weapp-tailwindcss" alt="GitHub stars"></a>
  <a href="https://www.npmjs.com/package/weapp-tailwindcss"><img src="https://badgen.net/npm/dm/weapp-tailwindcss" alt="npm downloads"></a>
  <a href="https://www.npmjs.com/package/weapp-tailwindcss"><img src="https://badgen.net/npm/license/weapp-tailwindcss" alt="license"></a>
  <a href="https://github.com/sonofmagic/weapp-tailwindcss/actions/workflows/ci.yml"><img src="https://github.com/sonofmagic/weapp-tailwindcss/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI"></a>
  <a href="https://codecov.io/gh/sonofmagic/weapp-tailwindcss"><img src="https://codecov.io/gh/sonofmagic/weapp-tailwindcss/branch/main/graph/badge.svg?token=zn05qXYznt" alt="codecov"></a>
  <a href="https://deepwiki.com/sonofmagic/weapp-tailwindcss"><img src="https://deepwiki.com/badge.svg" alt="DeepWiki"></a>
</p>

## What It Is

`weapp-tailwindcss` is a cross-platform Tailwind CSS toolchain. It brings one utility-first development experience to Web/H5, mini programs, App WebViews, React Native, and Lynx.

The core package owns Tailwind CSS v4 generation, class transforms, platform compatibility, and builder lifecycle integrations. Platform and runtime packages extend the same workflow to different renderers and application frameworks.

The goal is simple: use one Tailwind input and generate the correct artifact for each target, instead of maintaining disconnected class rules for every platform.

## Support Matrix

| Target | Recommended entry | Use it for |
| --- | --- | --- |
| Web / H5 | `weapp-tailwindcss/vite`, `/webpack`, `/rspack`, `/gulp`, or the Node API | Browser CSS, H5, and regular Web builds |
| Mini programs | The matching builder entry, or `@weapp-tailwindcss/cli --target weapp` | WeChat, Alipay, Douyin, QQ, and other mini-program CSS |
| App WebView | `weapp-tailwindcss` framework integrations | App WebView builds from frameworks such as uni-app and Taro |
| uni-app x | `weapp-tailwindcss/vite` | Native Android, iOS, and HarmonyOS application builds |
| React Native / Expo | `@weapp-tailwindcss/react-native` | Metro, Babel, and React Native style manifests |
| ReactLynx / Rspeedy | `@weapp-tailwindcss/lynx` | Lynx CSS and Rspeedy builds |

The current mainline targets Tailwind CSS v4. Each integration reuses the core generator, while CSS properties and selectors still need to be verified against the real target runtime.

## Quick Start

### 1. Install Tailwind CSS and the core package

```bash
pnpm add -D tailwindcss weapp-tailwindcss
```

### 2. Create a CSS-first entry

```css
@import "tailwindcss";

@source "./**/*.{html,js,ts,jsx,tsx,vue}";
@source not "../node_modules";
@source not "../dist";
```

The entry must be imported by the project. `cssEntries` tells the generator which Tailwind entry to track; it does not replace the bundler module graph.

### 3. Register the builder integration

With Vite, register the framework plugin first and `WeappTailwindcss` after it:

```ts
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const projectRoot = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    // Put your framework plugin here first, for example uni().
    WeappTailwindcss({
      cssEntries: [resolve(projectRoot, 'src/app.css')],
      cssOptions: {
        rem2rpx: true,
      },
    }),
  ],
})
```

See the [framework integration guides](https://tw.icebreaker.top/docs/quick-start/frameworks/uni-app-vite) for Webpack, Rspack, Gulp, Taro, uni-app, Mpx, and native mini-program projects.

## CLI

For standalone CSS builds, watch mode, or canonicalization, install `@weapp-tailwindcss/cli`:

```bash
pnpm add -D @weapp-tailwindcss/cli weapp-tailwindcss tailwindcss

# Generate Web CSS by default
pnpm exec weapp-tw -i src/app.css -o dist/output.css

# Explicitly generate mini-program-compatible CSS
pnpm exec weapp-tw -i src/app.css -o dist/app.wxss --target weapp
```

The CLI defaults to `web` and supports stdin/stdout, watch mode, native watchers, `--poll`, minify, optimize, source maps, and `canonicalize`. `--target weapp` is CSS-only: it does not scan or rewrite WXML, JS, TS, JSX, or TSX, and it does not replace a full project builder integration.

See the complete [weapp-tw CLI guide](https://tw.icebreaker.top/docs/tools/weapp-tw-cli) for all options and compatibility commands.

## Choose The Right Package

| Need | Package |
| --- | --- |
| Tailwind CSS generation, class transforms, and builder integrations | `weapp-tailwindcss` |
| Standalone CSS CLI, watch, and canonicalize | `@weapp-tailwindcss/cli` |
| PostCSS AST transforms, selector compatibility, and CSS platform transforms | `@weapp-tailwindcss/postcss` |
| React Native / Expo compilation | `@weapp-tailwindcss/react-native` |
| ReactLynx / Rspeedy integration | `@weapp-tailwindcss/lynx` |
| Runtime `twMerge`, `tv`, and `cva` utilities | `@weapp-tailwindcss/runtime`, `@weapp-tailwindcss/merge`, `@weapp-tailwindcss/variants`, `@weapp-tailwindcss/cva` |
| Typography, theme transitions, and cross-platform UI | `@weapp-tailwindcss/typography`, `theme-transition`, `@weapp-tailwindcss/ui` |

## Important Boundaries

- Tailwind CSS v4 generation is owned by `weapp-tailwindcss`. Do not register `tailwindcss`, `@tailwindcss/postcss`, or `@tailwindcss/vite` as a second generator in mini-program builds.
- JS and WXML classes are transformed only when they belong to the exact candidate set confirmed by the Tailwind generator. Ordinary business strings are not rewritten heuristically.
- Builder integrations use Vite, Webpack, Rspack, and Gulp lifecycle APIs to preserve source, style, dependency, and watch relationships instead of reconstructing state from a post-build directory scan.
- React Native, Lynx, and mini-program CSS capabilities are not identical to browser CSS. Validate unsupported properties, selectors, and runtime behavior on the actual target.

## Requirements

- Node.js `>=22.12.0`
- Tailwind CSS `>=4.0.0`
- HBuilderX `>=5.11` for `uni-app` / `uni-app x` projects using HBuilderX

## Documentation And Examples

- [Official website](https://tw.icebreaker.top)
- [Install and quick start](https://tw.icebreaker.top/docs/quick-start/install)
- [Tailwind CSS v4 guide](https://tw.icebreaker.top/docs/quick-start/v4)
- [Framework integrations](https://tw.icebreaker.top/docs/quick-start/frameworks/uni-app-vite)
- [React Native / Expo](https://tw.icebreaker.top/docs/quick-start/react-native-expo)
- [ReactLynx / Rspeedy](https://tw.icebreaker.top/docs/quick-start/frameworks/lynx)
- [Multi-platform guide](https://tw.icebreaker.top/docs/multi-platform)
- [API reference](https://tw.icebreaker.top/docs/api/interfaces/UserDefinedOptions)
- [CLI guide](https://tw.icebreaker.top/docs/tools/weapp-tw-cli)
- [Framework examples](https://github.com/sonofmagic/weapp-tailwindcss/tree/main/demo)
- [React Native and Lynx examples](https://github.com/sonofmagic/weapp-tailwindcss/tree/main/examples)
- [Mirror documentation](https://ice-tw.netlify.app/)

## AI Skills

The official skills are split by setup, migration, troubleshooting, runtime classes, custom builds, and React Native. Install the complete suite with:

```bash
npx skills add sonofmagic/skills \
  --skill weapp-tailwindcss \
  --skill weapp-tailwindcss-setup \
  --skill weapp-tailwindcss-migrate \
  --skill weapp-tailwindcss-troubleshoot \
  --skill weapp-tailwindcss-runtime \
  --skill weapp-tailwindcss-custom-build \
  --skill weapp-tailwindcss-react-native \
  -y
```

The original single-skill command remains available:

```bash
npx skills add sonofmagic/skills --skill weapp-tailwindcss
```

Read more in the [Skill documentation](https://tw.icebreaker.top/docs/ai/basics/skill).

## Contributing

Issues, reproducible bug reports, framework examples, documentation improvements, transform fixes, and tests are welcome. Before contributing, read the root `AGENTS.md` and the closest `AGENTS.md` for the target directory, then run the relevant `pnpm` checks locally.

## License

[MIT](./LICENSE)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=sonofmagic/weapp-tailwindcss&type=Date)](https://star-history.com/#sonofmagic/weapp-tailwindcss&Date)
