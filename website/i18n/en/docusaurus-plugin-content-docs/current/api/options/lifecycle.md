---
title: 🧭 life cycle
sidebar_label: 🧭 life cycle
sidebar_position: 3
description: '🧭 Life cycle: 4 UserDefinedOptions configuration items, including type, default value and source code description.'
keywords:
  - weapp-tailwindcss
  - API
  - Interface documentation
  - Configuration items
  - Mini program
  - tailwindcss
  - WeChat applet
  - life cycle
  - 🧭 life cycle
  - life cycle configuration
  - Plug-in parameters
---

This page contains 4 configuration items, sourced from `UserDefinedOptions`.

## Configuration overview

| Configuration item    | Type                                                                    | Default value | Description                                             |
| --------------------- | ----------------------------------------------------------------------- | ------------- | ------------------------------------------------------- |
| [onLoad](#onload)     | <code>(() => void)</code>                                               | —             | Triggered when the plug-in `apply` is initially called. |
| [onStart](#onstart)   | <code>(() => void)</code>                                               | —             | Triggered before starting processing.                   |
| [onUpdate](#onupdate) | <code>(filename: string, oldVal: string, newVal: string) => void</code> | —             | Triggered after matching and modifying the file.        |
| [onEnd](#onend)       | <code>(() => void)</code>                                               | —             | Triggered when processing ends.                         |

## Detailed description

### onLoad

> Optional | Type: `(() => void)`

Fired when the plugin `apply` is initially called.

#### return

`void`

### onStart

> Optional | Type: `(() => void)`

Triggered before starting processing.

#### return

`void`

### onUpdate

> Optional | Type: `(filename: string, oldVal: string, newVal: string) => void`

Triggered after a file is matched and modified.

#### Parameters

##### filename

`string`

##### oldVal

`string`

##### newVal

`string`

#### return

`void`

### onEnd

> Optional | Type: `(() => void)`

Fires when processing ends.

#### return

`void`
