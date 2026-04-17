import fs from 'node:fs'
import path from 'node:path'
import { getCss } from '#test/helpers/getTwCss'
import { generateCss4 } from '@weapp-tailwindcss/test-helper'
import directReset from '@weapp-tailwindcss/reset'
import { execa } from 'execa'
import { beforeAll, describe, expect, it } from 'vitest'
import reset from '@/reset'

const repoRoot = path.resolve(__dirname, '../../..')
const resetDistEntry = path.resolve(__dirname, '../../dist/reset.js')
const externalResetDistEntry = path.resolve(__dirname, '../../../reset/dist/index.cjs')

beforeAll(async () => {
  if (!fs.existsSync(externalResetDistEntry)) {
    await execa('pnpm', ['--filter', '@weapp-tailwindcss/reset', 'run', 'build'], {
      cwd: repoRoot,
    })
  }
  if (!fs.existsSync(resetDistEntry)) {
    await execa('pnpm', ['--filter', 'weapp-tailwindcss', 'run', 'build'], {
      cwd: repoRoot,
    })
  }
}, 120_000)

const BUTTON_REGEX = /button\{padding:0;background-color:transparent;font-size:inherit;line-height:inherit;color:inherit;border-width:0;?\}/
const BUTTON_PSEUDO_REGEX = /button::after\{border:none;?\}/
const IMAGE_REGEX = /image,img\{display:block;border-width:0;background-color:transparent;max-width:100%;height:auto;?\}/
const INPUT_REGEX = /input\{padding:0;font-size:100%;font-family:inherit;line-height:inherit;color:inherit;background-color:transparent;border-width:0;?\}/
const TEXTAREA_REGEX = /textarea\{padding:0;font-size:100%;font-family:inherit;line-height:inherit;color:inherit;background-color:transparent;border-width:0;resize:vertical;?\}/
const LIST_REGEX = /ul,ol\{list-style:none;margin:0;padding:0;?\}/
const NAVIGATOR_REGEX = /navigator,a\{color:inherit;text-decoration:inherit;?\}/
const VIDEO_REGEX = /video\{display:block;max-width:100%;height:auto;?\}/

function createBaseConfig() {
  return {
    corePlugins: {
      preflight: false,
    },
  }
}

async function renderBaseCss(caseId: string, plugins: ReturnType<typeof reset>[]) {
  return await getCss(caseId, {
    css: '@tailwind base;',
    twConfig: {
      ...createBaseConfig(),
      plugins,
    },
  })
}

describe('reset plugin', () => {
  it('injects default button and image resets for tailwindcss v3', async () => {
    const { css } = await renderBaseCss('compat-default-button-image', [reset()])

    const normalized = css.replace(/\s+/g, '')
    expect(normalized).toMatch(BUTTON_REGEX)
    expect(normalized).toMatch(BUTTON_PSEUDO_REGEX)
    expect(normalized).toMatch(IMAGE_REGEX)
  })

  it('supports disabling button and image resets independently', async () => {
    const { css } = await renderBaseCss('compat-disable-button', [
      reset({
        buttonReset: false,
      }),
    ])
    const withoutButton = css.replace(/\s+/g, '')
    expect(withoutButton).not.toMatch(BUTTON_REGEX)
    expect(withoutButton).toMatch(IMAGE_REGEX)

    const { css: cssWithoutImage } = await renderBaseCss('compat-disable-image', [
      reset({
        imageReset: false,
      }),
    ])
    const normalized = cssWithoutImage.replace(/\s+/g, '')
    expect(normalized).toMatch(BUTTON_REGEX)
    expect(normalized).not.toMatch(IMAGE_REGEX)
  })

  it('allows customizing selectors and declarations', async () => {
    const { css } = await renderBaseCss('compat-custom-selectors', [
      reset({
        buttonReset: {
          selectors: ['.wx-reset-btn'],
          declarations: {
            padding: '0',
            backgroundColor: 'transparent',
            borderWidth: '0',
          },
          pseudo: {
            border: 'none',
          },
        },
        imageReset: {
          selectors: ['.wx-reset-image'],
          declarations: {
            display: 'inline-block',
            borderWidth: '0',
          },
        },
      }),
    ])

    const normalized = css.replace(/\s+/g, '')
    expect(normalized).toMatch(/\[class~="wx-reset-btn"\]\{[^}]*padding:0;[^}]*border-width:0[^}]*\}/)
    expect(normalized).toMatch(/\[class~="wx-reset-btn"\]::after\{[^}]*border:none;?\}/)
    expect(normalized).toMatch(/\[class~="wx-reset-image"\]\{[^}]*display:inline-block;[^}]*border-width:0[^}]*\}/)
  })

  it('supports presets through the compatibility export', async () => {
    const { css } = await renderBaseCss('compat-preset-all-disable-partial', [
      reset({
        preset: 'all',
        listReset: false,
        navigatorReset: false,
      }),
    ])

    const normalized = css.replace(/\s+/g, '')
    expect(normalized).toMatch(BUTTON_REGEX)
    expect(normalized).toMatch(IMAGE_REGEX)
    expect(normalized).toMatch(INPUT_REGEX)
    expect(normalized).toMatch(TEXTAREA_REGEX)
    expect(normalized).toMatch(VIDEO_REGEX)
    expect(normalized).not.toMatch(LIST_REGEX)
    expect(normalized).not.toMatch(NAVIGATOR_REGEX)
  })

  it('accepts extra resets', async () => {
    const { css } = await renderBaseCss('compat-extra-resets', [
      reset({
        extraResets: [
          {
            selectors: ['.wx-reset-view'],
            declarations: {
              display: 'block',
              borderWidth: '0',
            },
            pseudo: {
              borderColor: 'transparent',
            },
          },
        ],
      }),
    ])

    const normalized = css.replace(/\s+/g, '')
    expect(normalized).toMatch(/\[class~="wx-reset-view"\]\{display:block;border-width:0;?\}/)
    expect(normalized).toMatch(/\[class~="wx-reset-view"\]::after\{border-color:transparent;?\}/)
  })

  it('keeps compatibility export output aligned with @weapp-tailwindcss/reset', async () => {
    const options = {
      preset: ['content', 'media'],
      navigatorReset: {
        selectors: ['.wx-reset-link'],
        declarations: {
          color: 'inherit',
          textDecoration: 'none',
        },
      },
      extraResets: [
        {
          selectors: ['.wx-reset-view'],
          declarations: {
            display: 'block',
          },
        },
      ],
    }

    const { css: compatCss } = await renderBaseCss('compat-alignment-compat', [reset(options)])
    const { css: directCss } = await renderBaseCss('compat-alignment-direct', [directReset(options)])

    expect(compatCss.replace(/\s+/g, '')).toBe(directCss.replace(/\s+/g, ''))
  })

  it('works with tailwindcss v4 via @plugin', async () => {
    const baseDir = path.resolve(__dirname, './fixtures/v4')
    const { css } = await generateCss4(baseDir, {
      css: `
        @plugin "weapp-tailwindcss/reset";
        @import "tailwindcss/utilities";
      `,
    })

    const normalized = css.replace(/\s+/g, '')
    expect(normalized).toMatch(BUTTON_REGEX)
    expect(normalized).toMatch(IMAGE_REGEX)
  })
})
