# `tailwindcss-config`

A lightweight utility for dynamically loading Tailwind CSS configuration files. It supports multiple formats and provides a seamless way to work with Tailwind configuration in your projects.

---

## Features

- **Multi-format support**: Handles `.js`, `.cjs`, `.mjs`, `.ts`, `.cts`, and `.mts` configuration files.
- **Automatic discovery**: Searches for configuration files in the current working directory or a specified path.
- **Graceful fallback**: Returns `undefined` if no configuration is found, ensuring compatibility with dynamic setups.
- **TypeScript support**: Fully typed for use in TypeScript projects.

---

## Installation

Install the package via npm:

```bash
npm i -D tailwindcss-config
```

Or using Yarn:

```bash
yarn add -D tailwindcss-config
```

---

## Usage

### Import the Function

```typescript
import { loadConfig } from 'tailwindcss-config'
```

### Examples

#### 1. Default Usage

The function searches for Tailwind CSS configuration files in the current working directory:

```typescript
(async () => {
  const config = await loadConfig()
  console.log(config)
})()
```

#### 2. Specify a Configuration File

Explicitly specify a path to a Tailwind CSS configuration file:

```typescript
(async () => {
  const config = await loadConfig({ config: './tailwind.config.ts' })
  console.log(config)
})()
```

#### 3. Change the Working Directory

Set a custom working directory to search for Tailwind configuration files:

```typescript
(async () => {
  const config = await loadConfig({ cwd: '/my/project/directory' })
  console.log(config)
})()
```

---

## Supported Configuration Formats

The utility supports the following file types:

- `tailwind.config.js`
- `tailwind.config.cjs`
- `tailwind.config.mjs`
- `tailwind.config.ts`
- `tailwind.config.cts`
- `tailwind.config.mts`

Dynamic imports are powered by [`jiti`](https://github.com/unjs/jiti), allowing the utility to handle various file types seamlessly.

---

## API Reference

### `loadConfig(options?: Partial<LoadConfigOptions>)`

#### Parameters

| Parameter        | Type                         | Description                                     | Default         |
| ---------------- | ---------------------------- | ----------------------------------------------- | --------------- |
| `options`        | `Partial<LoadConfigOptions>` | Options to customize configuration loading.     | `{}`            |
| `options.cwd`    | `string`                     | Directory to search for configuration files.    | `process.cwd()` |
| `options.config` | `string`                     | Path to a specific Tailwind configuration file. | `undefined`     |

#### Returns

A `Promise` that resolves to a `Config` object or `undefined` if no configuration file is found.

---

## File Search Order

The utility uses [`lilconfig`](https://github.com/antonk52/lilconfig) to locate configuration files. It searches for the following files (in order):

1. `tailwind.config.js`
2. `tailwind.config.cjs`
3. `tailwind.config.mjs`
4. `tailwind.config.ts`
5. `tailwind.config.cts`
6. `tailwind.config.mts`

---

## Example Project Structure

```plaintext
my-project/
├── src/
│   └── index.ts
├── tailwind.config.ts
└── tailwind.config.js
```

### Loading Configuration

```typescript
(async () => {
  const config = await loadConfig({ cwd: './my-project' })
  console.log(config)
})()
```

---

## Error Handling

The `loadConfig` function does not throw an error if no configuration is found. Instead, it resolves to `undefined`. This ensures compatibility with projects where Tailwind configuration is optional or dynamically generated.

---

## Contributing

Contributions are welcome! To get started:

1. Fork this repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a clear description of your changes.

---

## License

This project is licensed under the [MIT License](../../LICENSE).
