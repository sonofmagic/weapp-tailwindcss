---
title: Introduction
description: Mini app runtimes come with their own technical constraints, and weapp-tailwindcss bridges Tailwind CSS back into that environment.
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

Mini app runtimes have their own **distinct** technical rules, so many features you take for granted on the web are not available as-is.

That also means you cannot **directly** use a utility-first CSS generator like [`tailwindcss`](https://www.tailwindcss.com/) to speed up development.

`weapp-tailwindcss` exists to bring **most** of Tailwind CSS back into mini app development.

It supports mainstream multi-platform mini app frameworks built on `webpack` and `vite`, and also native mini app packaging flows built on `webpack` or `gulp`.

You can integrate `tailwindcss` into frameworks or native development with very little friction.

Let's get started.

:::info
At its core, this project is a string escaper. It takes the class names collected by `tailwindcss` and the CSS output it generates, then converts them into forms that mini app runtimes can accept.
:::

## Environment requirements

- `weapp-tailwindcss@5.2.0` and newer requires Node.js `>=22.12.0`. From that version onward, Node.js 22 can load ESM from CommonJS by default.
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

## Demo video

<iframe src="//player.bilibili.com/player.html?aid=835925684&bvid=BV1fg4y1D7xx&cid=1398844948&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

## Special thanks to [Shunyue](https://space.bilibili.com/475498258) for producing a video for `weapp-tailwindcss`

<iframe src="//player.bilibili.com/player.html?aid=1850100366&bvid=BV1kp421Z7HL&cid=1428939742&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
