---
title: Introduction
description: weapp-tailwindcss compiles Tailwind CSS 4 for Web, mini programs, App WebView, React Native, and Lynx targets.
keywords:
  - introduction
  - intro
  - weapp-tailwindcss
  - tailwindcss
  - mini app
  - mini program
  - uni-app
  - taro
  - mpx
---

# Introduction

## Overview

`weapp-tailwindcss` is the cross-platform compiler and build integration layer for Tailwind CSS 4. It generates browser CSS, mini-program-compatible CSS, and App WebView styles, while sharing candidate and token foundations with the React Native and Lynx integrations.

The core package supports Vite, Webpack, Rspack, Gulp, and Node.js. Mini-program builds also transform generated class names in templates and scripts; React Native and Lynx use their corresponding platform packages.

:::info
The generator first compiles candidates with Tailwind CSS 4, then adapts selectors, CSS capabilities, and class mappings for the selected target. JS/WXML transforms only process candidates confirmed by the generator.
:::

## Environment requirements

- The current release line requires Node.js `^22.18.0 || >=24.11.0`.
- `uni-app` / `uni-app x` projects that use HBuilderX require HBuilderX `>=5.11`.

## Why `weapp-tailwindcss`?

- ✅ Handles all relevant files automatically. Using WeChat Mini Program as an example, it can process and escape not only `wxml` / `wxss`, but also `js` and `wxs` output.
- ✅ Supports native mini app development as well as frameworks such as `taro`, `uni-app`, and `mpx`.
- ✅ Offers multiple integration styles, including `webpack` / `vite` / `gulp` plugins and a direct `nodejs api`.
- ✅ Comes with a rich ecosystem and ready-to-run templates, so you can reuse existing `tailwindcss` tooling to build mini apps.
- ✅ Uses efficient parsing and caching for fast hot updates.
- ✅ Stays close to the `tailwindcss` mental model and works well with IntelliSense.

## Quick start :rocket:

### 👉 [Install dependencies](/docs/quick-start/install)

The current docs target `tailwindcss@4` with the latest `weapp-tailwindcss`.

For runnable integrations, browse the maintained examples in the [project repository](https://github.com/sonofmagic/weapp-tailwindcss/tree/main/demo).
