import { generateCss3 } from '@weapp-tailwindcss/test-helper'
import { describe, expect, it } from 'vitest'
import reset from '@/index'

const BUTTON_REGEX = /button\{padding:0;background-color:transparent;font-size:inherit;line-height:inherit;color:inherit;border-width:0;?\}/
const BUTTON_PSEUDO_REGEX = /button::after\{border:none;?\}/
const IMAGE_REGEX = /image,img\{display:block;border-width:0;background-color:transparent;max-width:100%;height:auto;?\}/

describe('@weapp-tailwindcss/reset plugin', () => {
  it('injects default button and image resets for tailwindcss v3', async () => {
    const { css } = await generateCss3('', {
      css: '@tailwind base;',
      twConfig: {
        content: [{ raw: 'noop' }],
        plugins: [reset()],
      },
    })

    const normalized = css.replace(/\s+/g, '')
    expect(normalized).toMatch(BUTTON_REGEX)
    expect(normalized).toMatch(BUTTON_PSEUDO_REGEX)
    expect(normalized).toMatch(IMAGE_REGEX)
  })

  it('supports disabling button and image resets independently', async () => {
    const { css } = await generateCss3('', {
      css: '@tailwind base;',
      twConfig: {
        content: [{ raw: 'noop' }],
        plugins: [
          reset({
            buttonReset: false,
          }),
        ],
      },
    })
    const withoutButton = css.replace(/\s+/g, '')
    expect(withoutButton).not.toMatch(BUTTON_REGEX)
    expect(withoutButton).toMatch(IMAGE_REGEX)

    const { css: cssWithoutImage } = await generateCss3('', {
      css: '@tailwind base;',
      twConfig: {
        content: [{ raw: 'noop' }],
        plugins: [
          reset({
            imageReset: false,
          }),
        ],
      },
    })
    const normalized = cssWithoutImage.replace(/\s+/g, '')
    expect(normalized).toMatch(BUTTON_REGEX)
    expect(normalized).not.toMatch(IMAGE_REGEX)
  })

  it('allows customizing selectors and declarations', async () => {
    const { css } = await generateCss3('', {
      css: '@tailwind base;',
      twConfig: {
        content: [{ raw: 'noop' }],
        plugins: [
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
        ],
      },
    })

    const normalized = css.replace(/\s+/g, '')
    expect(normalized).toMatch(/\[class~="wx-reset-btn"\]\{[^}]*padding:0;[^}]*border-width:0[^}]*\}/)
    expect(normalized).toMatch(/\[class~="wx-reset-btn"\]::after\{[^}]*border:none;?\}/)
    expect(normalized).toMatch(/\[class~="wx-reset-image"\]\{[^}]*display:inline-block;[^}]*border-width:0[^}]*\}/)
  })

  it('accepts extra resets', async () => {
    const { css } = await generateCss3('', {
      css: '@tailwind base;',
      twConfig: {
        content: [{ raw: 'noop' }],
        plugins: [
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
        ],
      },
    })

    const normalized = css.replace(/\s+/g, '')
    expect(normalized).toMatch(/\[class~="wx-reset-view"\]\{display:block;border-width:0;?\}/)
    expect(normalized).toMatch(/\[class~="wx-reset-view"\]::after\{border-color:transparent;?\}/)
  })
})
