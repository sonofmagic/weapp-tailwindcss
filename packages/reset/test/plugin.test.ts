import { describe, expect, it } from 'vitest'
import reset from '@/index'

type BaseRules = Record<string, Record<string, string>>

function collectBaseRules(plugin: ReturnType<typeof reset>) {
  const calls: BaseRules[] = []
  plugin.handler({
    addBase(base: BaseRules) {
      calls.push(base)
    },
  })
  return Object.assign({}, ...calls)
}

describe('@weapp-tailwindcss/reset plugin', () => {
  it('injects default button and image resets', () => {
    const baseRules = collectBaseRules(reset())

    expect(baseRules.button).toMatchObject({
      padding: '0',
      backgroundColor: 'transparent',
      fontSize: 'inherit',
      lineHeight: 'inherit',
      color: 'inherit',
      borderWidth: '0',
    })
    expect(baseRules['button::after']).toEqual({ border: 'none' })
    expect(baseRules['image,img']).toMatchObject({
      display: 'block',
      borderWidth: '0',
      backgroundColor: 'transparent',
      maxWidth: '100%',
      height: 'auto',
    })
  })

  it('supports disabling button and image resets independently', () => {
    const withoutButton = collectBaseRules(reset({ buttonReset: false }))
    expect(withoutButton.button).toBeUndefined()
    expect(withoutButton['image,img']).toBeDefined()

    const withoutImage = collectBaseRules(reset({ imageReset: false }))
    expect(withoutImage.button).toBeDefined()
    expect(withoutImage['image,img']).toBeUndefined()
  })

  it('supports form preset', () => {
    const baseRules = collectBaseRules(reset({ preset: 'form' }))

    expect(baseRules.button).toBeDefined()
    expect(baseRules['image,img']).toBeDefined()
    expect(baseRules.input).toBeDefined()
    expect(baseRules.textarea).toBeDefined()
  })

  it('auto-enables a built-in reset when its config object is provided directly', () => {
    const baseRules = collectBaseRules(reset({
      inputReset: {
        selectors: ['.wx-reset-input'],
        declarations: {
          padding: '0',
          borderWidth: '0',
          backgroundColor: 'transparent',
        },
      },
      navigatorReset: {
        selectors: ['.wx-reset-link'],
        declarations: {
          color: 'inherit',
          textDecoration: 'none',
        },
      },
    }))

    expect(baseRules.button).toBeDefined()
    expect(baseRules['image,img']).toBeDefined()
    expect(baseRules['[class~="wx-reset-input"]']).toMatchObject({
      padding: '0',
      borderWidth: '0',
      backgroundColor: 'transparent',
    })
    expect(baseRules['[class~="wx-reset-link"]']).toEqual({
      color: 'inherit',
      textDecoration: 'none',
    })
    expect(baseRules.input).toBeUndefined()
    expect(baseRules['navigator,a']).toBeUndefined()
  })

  it('supports combined presets and keeps default compatibility', () => {
    const baseRules = collectBaseRules(reset({ preset: ['content', 'media'] }))

    expect(baseRules.button).toBeDefined()
    expect(baseRules['image,img']).toBeDefined()
    expect(baseRules['ul,ol']).toBeDefined()
    expect(baseRules['navigator,a']).toBeDefined()
    expect(baseRules.video).toBeDefined()
    expect(baseRules.input).toBeUndefined()
  })

  it('merges multiple presets and still allows later option overrides', () => {
    const baseRules = collectBaseRules(reset({
      preset: ['form', 'content'],
      textareaReset: false,
      navigatorReset: {
        selectors: ['.wx-reset-link'],
        declarations: {
          color: 'inherit',
          textDecoration: 'none',
        },
      },
    }))

    expect(baseRules.button).toBeDefined()
    expect(baseRules['image,img']).toBeDefined()
    expect(baseRules.input).toBeDefined()
    expect(baseRules.textarea).toBeUndefined()
    expect(baseRules['ul,ol']).toBeDefined()
    expect(baseRules['[class~="wx-reset-link"]']).toEqual({
      color: 'inherit',
      textDecoration: 'none',
    })
  })

  it('allows preset-enabled items to be disabled explicitly', () => {
    const baseRules = collectBaseRules(reset({
      preset: 'all',
      listReset: false,
      navigatorReset: false,
    }))

    expect(baseRules.input).toBeDefined()
    expect(baseRules.textarea).toBeDefined()
    expect(baseRules.video).toBeDefined()
    expect(baseRules['ul,ol']).toBeUndefined()
    expect(baseRules['navigator,a']).toBeUndefined()
  })

  it('allows customizing selectors and declarations', () => {
    const baseRules = collectBaseRules(reset({
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
    }))

    expect(baseRules['[class~="wx-reset-btn"]']).toMatchObject({
      padding: '0',
      backgroundColor: 'transparent',
      borderWidth: '0',
    })
    expect(baseRules['[class~="wx-reset-btn"]::after']).toEqual({ border: 'none' })
    expect(baseRules['[class~="wx-reset-image"]']).toMatchObject({
      display: 'inline-block',
      borderWidth: '0',
    })
  })

  it('allows customizing preset-enabled built-in resets', () => {
    const baseRules = collectBaseRules(reset({
      preset: 'content',
      listReset: {
        selectors: ['.wx-reset-list'],
        declarations: {
          listStyle: 'none',
          margin: '0',
          padding: '0',
        },
      },
    }))

    expect(baseRules['[class~="wx-reset-list"]']).toEqual({
      listStyle: 'none',
      margin: '0',
      padding: '0',
    })
  })

  it('accepts extra resets', () => {
    const baseRules = collectBaseRules(reset({
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
    }))

    expect(baseRules['[class~="wx-reset-view"]']).toEqual({
      display: 'block',
      borderWidth: '0',
    })
    expect(baseRules['[class~="wx-reset-view"]::after']).toEqual({
      borderColor: 'transparent',
    })
  })
})
