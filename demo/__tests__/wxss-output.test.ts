import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const DEMO_ROOT = fileURLToPath(new URL('..', import.meta.url))
const APP_WXSS_BASENAMES = [
  ['dist', 'app.wxss'],
  ['app.wxss'],
]
const APP_WXSS_FILENAME = 'app.wxss'
const IGNORED_OUTPUT_DIRS = new Set(['node_modules'])
const TAILWIND_V4_ROOT_SELECTORS = [
  ':host,page,.tw-root,wx-root-portal-content',
  'page,.tw-root,wx-root-portal-content,:host',
]
const TAILWIND_V4_PREFLIGHT_SELECTORS = [
  'view,text,:after,:before',
  'view,text,:before,:after',
]

const RAW_SNIPPETS = [
  {
    label: 'hr reset',
    css: `
      hr {
        border-top-width: 1rpx;
        color: inherit;
        height: 0;
      }
    `,
  },
  {
    label: 'abbr underline',
    css: `
      abbr {
        -webkit-text-decoration: underline dotted;
        text-decoration: underline;
        text-decoration: underline dotted;
      }
    `,
  },
  {
    label: 'heading inherit',
    css: `
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-size: inherit;
        font-weight: inherit;
      }
    `,
  },
  {
    label: 'anchor inherit',
    css: `
      a {
        color: inherit;
        -webkit-text-decoration: inherit;
        text-decoration: inherit;
      }
    `,
  },
  {
    label: 'b/strong bold',
    css: `
      b,
      strong {
        font-weight: bolder;
      }
    `,
  },
  {
    label: 'mono font family',
    css: `
      code,
      kbd,
      pre,
      samp {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-family: var(
          --default-mono-font-family,
          ui-monospace,
          SFMono-Regular,
          Menlo,
          Monaco,
          Consolas,
          "Liberation Mono",
          "Courier New",
          monospace
        );
        -webkit-font-feature-settings: normal;
        -webkit-font-feature-settings: var(--default-mono-font-feature-settings, normal);
        font-feature-settings: normal;
        font-feature-settings: var(--default-mono-font-feature-settings, normal);
        font-size: 1em;
        font-variation-settings: normal;
        font-variation-settings: var(--default-mono-font-variation-settings, normal);
      }
    `,
  },
  {
    label: 'small font size',
    css: `
      small {
        font-size: 80%;
      }
    `,
  },
  {
    label: 'sub/sup reset',
    css: `
      sub,
      sup {
        font-size: 75%;
        line-height: 0;
        position: relative;
        vertical-align: baseline;
      }
    `,
  },
  {
    label: 'sub baseline',
    css: `
      sub {
        bottom: -0.25em;
      }
    `,
  },
  {
    label: 'sup baseline',
    css: `
      sup {
        top: -0.5em;
      }
    `,
  },
  {
    label: 'table reset',
    css: `
      table {
        border-collapse: collapse;
        border-color: inherit;
        text-indent: 0;
      }
    `,
  },
  {
    label: 'moz focusring',
    css: `
      :-moz-focusring {
        outline: auto;
      }
    `,
  },
  {
    label: 'progress baseline',
    css: `
      progress {
        vertical-align: baseline;
      }
    `,
  },
  {
    label: 'summary display',
    css: `
      summary {
        display: list-item;
      }
    `,
  },
  {
    label: 'list reset',
    css: `
      menu,
      ol,
      ul {
        list-style: none;
      }
    `,
  },
  {
    label: 'media block display',
    css: `
      audio,
      canvas,
      embed,
      iframe,
      img,
      object,
      svg,
      video {
        display: block;
        vertical-align: middle;
      }
    `,
  },
  {
    label: 'media intrinsic sizing',
    css: `
      img,
      video {
        height: auto;
        max-width: 100%;
      }
    `,
  },
  {
    label: 'form control reset',
    css: `
      button,
      input,
      optgroup,
      select,
      textarea {
        background-color: rgba(0, 0, 0, 0);
        border-radius: 0;
        color: inherit;
        font: inherit;
        -webkit-font-feature-settings: inherit;
        font-feature-settings: inherit;
        font-variation-settings: inherit;
        letter-spacing: inherit;
        opacity: 1;
      }
    `,
  },
  {
    label: 'webkit upload reset',
    css: `
      ::-webkit-file-upload-button {
        background-color: rgba(0, 0, 0, 0);
        border-radius: 0;
        color: inherit;
        font: inherit;
        -webkit-font-feature-settings: inherit;
        font-feature-settings: inherit;
        font-variation-settings: inherit;
        letter-spacing: inherit;
        opacity: 1;
      }
    `,
  },
  {
    label: 'file selector reset',
    css: `
      ::file-selector-button {
        background-color: rgba(0, 0, 0, 0);
        border-radius: 0;
        color: inherit;
        font: inherit;
        -webkit-font-feature-settings: inherit;
        font-feature-settings: inherit;
        font-variation-settings: inherit;
        letter-spacing: inherit;
        opacity: 1;
      }
    `,
  },
  {
    label: 'optgroup weight',
    css: `
      select[multiple] optgroup,
      select[size] optgroup {
        font-weight: bolder;
      }
    `,
  },
  {
    label: 'optgroup option padding',
    css: `
      select[multiple] optgroup option,
      select[size] optgroup option {
        -webkit-padding-start: 20rpx;
        padding-left: 20rpx;
      }
    `,
  },
  {
    label: 'webkit upload margins',
    css: `
      ::-webkit-file-upload-button {
        -webkit-margin-end: 4rpx;
        margin-right: 4rpx;
      }
    `,
  },
  {
    label: 'file selector margins',
    css: `
      ::file-selector-button {
        -webkit-margin-end: 4rpx;
        margin-right: 4rpx;
      }
    `,
  },
  {
    label: 'webkit placeholder opacity',
    css: `
      ::-webkit-input-placeholder {
        opacity: 1;
      }
    `,
  },
  {
    label: 'moz placeholder opacity',
    css: `
      ::-moz-placeholder {
        opacity: 1;
      }
    `,
  },
  {
    label: 'ms legacy placeholder opacity',
    css: `
      :-ms-input-placeholder {
        opacity: 1;
      }
    `,
  },
  {
    label: 'ms placeholder opacity',
    css: `
      ::-ms-input-placeholder {
        opacity: 1;
      }
    `,
  },
  {
    label: 'placeholder opacity',
    css: `
      ::placeholder {
        opacity: 1;
      }
    `,
  },
]

const FORBIDDEN_SNIPPETS = RAW_SNIPPETS.map(entry => ({
  label: entry.label,
  pattern: normalizeCss(entry.css),
}))

describe('demo wxss artifacts', () => {
  it('excludes unsupported HTML tag selectors once dist output exists', () => {
    const artifacts = resolveAppWxssArtifacts()

    if (!artifacts.length) {
      return
    }

    const violations: string[] = []

    for (const file of artifacts) {
      const normalized = normalizeCss(fs.readFileSync(file, 'utf8'))
      for (const snippet of FORBIDDEN_SNIPPETS) {
        if (normalized.includes(snippet.pattern)) {
          violations.push(`${path.relative(DEMO_ROOT, file)} -> ${snippet.label}`)
        }
      }
    }

    const debugMessage = violations.length
      ? [
        'Found unsupported global selectors in compiled demo wxss artifacts:',
        ...violations.map(line => `  - ${line}`),
        'Rebuild the demo with weapp-tailwindcss sanitization enabled.',
      ].join('\n')
      : ''

    expect(violations, debugMessage || undefined).toEqual([])
  })

  it('does not duplicate Tailwind v4 root and preflight selectors in app wxss artifacts', () => {
    const artifacts = resolveRecursiveAppWxssArtifacts()

    if (!artifacts.length) {
      return
    }

    const violations: string[] = []

    for (const file of artifacts) {
      const normalized = normalizeSelectorCss(fs.readFileSync(file, 'utf8'))
      const rootCount = countSelectorOccurrences(normalized, TAILWIND_V4_ROOT_SELECTORS)
      const preflightCount = countSelectorOccurrences(normalized, TAILWIND_V4_PREFLIGHT_SELECTORS)

      if (rootCount > 1 || preflightCount > 1) {
        violations.push([
          `${path.relative(DEMO_ROOT, file)} ->`,
          `root=${rootCount}`,
          `preflight=${preflightCount}`,
        ].join(' '))
      }
    }

    const debugMessage = violations.length
      ? [
        'Found duplicated Tailwind v4 root/preflight selectors in compiled demo wxss artifacts:',
        ...violations.map(line => `  - ${line}`),
        'Rebuild the demo and check Vite processed CSS injection dedupe.',
      ].join('\n')
      : ''

    expect(violations, debugMessage || undefined).toEqual([])
  })
})

function resolveAppWxssArtifacts(): string[] {
  const artifacts: string[] = []
  const seen = new Set<string>()

  const entries = fs.readdirSync(DEMO_ROOT, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    if (entry.name === '__tests__' || entry.name === 'node_modules') {
      continue
    }

    const projectRoot = path.join(DEMO_ROOT, entry.name)
    for (const segments of APP_WXSS_BASENAMES) {
      const candidate = path.join(projectRoot, ...segments)
      if (!seen.has(candidate) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        artifacts.push(candidate)
        seen.add(candidate)
      }
    }
  }

  return artifacts
}

function normalizeCss(input: string): string {
  return input.replace(/\s+/g, '')
}

function resolveRecursiveAppWxssArtifacts(): string[] {
  const artifacts: string[] = []
  const entries = fs.readdirSync(DEMO_ROOT, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    if (entry.name === '__tests__' || IGNORED_OUTPUT_DIRS.has(entry.name)) {
      continue
    }

    collectAppWxssArtifacts(path.join(DEMO_ROOT, entry.name), artifacts)
  }

  return artifacts
}

function collectAppWxssArtifacts(dir: string, artifacts: string[]) {
  if (!fs.existsSync(dir)) {
    return
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (IGNORED_OUTPUT_DIRS.has(entry.name)) {
      continue
    }

    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectAppWxssArtifacts(file, artifacts)
      continue
    }

    if (entry.isFile() && entry.name === APP_WXSS_FILENAME) {
      artifacts.push(file)
    }
  }
}

function normalizeSelectorCss(input: string): string {
  return normalizeCss(input)
    .replace(/::(before|after)\b/g, ':$1')
}

function countSelectorOccurrences(input: string, selectors: string[]) {
  return selectors.reduce((count, selector) => count + countSubstring(input, selector), 0)
}

function countSubstring(input: string, substring: string) {
  if (substring.length === 0) {
    return 0
  }

  return input.split(substring).length - 1
}
