# TailwindCSS Injector

**English | [中文](./README-cn.md)**

- [TailwindCSS Injector](#tailwindcss-injector)
  - [Overview](#overview)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Basic Example](#basic-example)
  - [Options](#options)
    - [Example Configuration](#example-configuration)
  - [How It Works](#how-it-works)
  - [License](#license)

---

## Overview

`tailwindcss-injector` is a library designed to dynamically inject TailwindCSS directives and configurations into your CSS workflow. It includes a PostCSS plugin that supports multiple file extensions, dynamic configuration, and flexible filtering, enabling seamless integration into modern build pipelines.

---

## Features

- **Dynamic Directive Injection**: Automatically inserts TailwindCSS directives like `@tailwind base`, `@tailwind components`, and `@tailwind utilities`.
- **Multi-extension Support**: Processes files with customizable extensions (e.g., `.html`, `.js`, `.ts`).
- **Inline or External Configuration**: Accepts inline configuration objects or paths to configuration files.
- **Customizable Filters**: Use a filter function to process specific files.
- **TailwindCSS Integration**: Dynamically adjusts TailwindCSS configurations per file.

---

## Installation

Install the package and its dependencies:

```bash
npm install tailwindcss-injector tailwindcss postcss --save-dev
```

---

## Usage

To use the PostCSS plugin, import it from `tailwindcss-injector/postcss`:

### Basic Example

```javascript
const tailwindInjector = require('tailwindcss-injector/postcss')

module.exports = {
  plugins: [
    tailwindInjector({
      cwd: process.cwd(),
      config: './tailwind.config.js',
      directiveParams: ['base', 'components', 'utilities'],
      extensions: ['html', 'js', 'ts'],
      filter: input => !!input?.file && input.file.endsWith('.css'),
    }),
  ],
}
```

---

## Options

The plugin accepts the following options:

| Option            | Type                                                               | Description                                                         |
| ----------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `cwd`             | `string`                                                           | Current working directory.                                          |
| `config`          | `string \| Partial<Config> \| (input) => InlineTailwindcssOptions` | TailwindCSS configuration file path or inline configuration object. |
| `directiveParams` | `('base' \| 'components' \| 'utilities' \| 'variants')[]`          | Array of TailwindCSS directives to inject.                          |
| `extensions`      | `string[]`                                                         | Array of supported file extensions.                                 |
| `filter`          | `(input?: postcss.Input) => boolean`                               | Custom function to filter files to process.                         |

### Example Configuration

```javascript
{
  cwd: process.cwd(), // Set current working directory
  config: './tailwind.config.js', // Use an external TailwindCSS configuration file
  directiveParams: ['base', 'components', 'utilities'], // Inject directives dynamically
  extensions: ['html', 'js', 'ts'], // Process specific file extensions
  filter: (input) => !!input?.file && input.file.endsWith('.css'), // Filter for CSS files only
}
```

---

## How It Works

1. **Directive Injection**:
   The plugin ensures that the specified TailwindCSS directives (`@tailwind base`, `@tailwind components`, etc.) are injected into the CSS files.

2. **Dynamic Configuration**:
   TailwindCSS configurations are dynamically adjusted based on the processed files, including custom extensions.

3. **File Filtering**:
   Files to process can be filtered using the `filter` option.

4. **PostCSS Processing**:
   The plugin integrates with PostCSS to apply TailwindCSS transformations seamlessly.

---

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.
