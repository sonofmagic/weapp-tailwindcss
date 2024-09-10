// import { templateHandler } from '#test/v2/wxml'
import { getOptions } from '@/options'
import { createGetCase, wxmlCasePath } from '../util'

const getWxmlCase = createGetCase(wxmlCasePath)

describe('templeteHandler', () => {
  it('rd-tag case 0', async () => {
    const { templateHandler } = getOptions()
    const testCase = '<view class="rd-tag-box rd-tag-{{type}}-{{theme}} rd-tag-radius-{{radiusType}} rd-tag-disabeld-{{disabled}}-{{type}} rd-tag-size-{{size}} rd-tag-class"></view>'
    const str = await templateHandler(testCase)
    expect(str).toBe('<view class="rd-tag-box rd-tag-{{type}}-{{theme}} rd-tag-radius-{{radiusType}} rd-tag-disabeld-{{disabled}}-{{type}} rd-tag-size-{{size}} rd-tag-class"></view>')
  })

  it('rd-tag case 1', async () => {
    const { templateHandler } = getOptions()
    const testCase = '<view class="rd-tag-{{type}}-{{theme}}"></view>'
    const str = await templateHandler(testCase)
    expect(str).toBe('<view class="rd-tag-{{type}}-{{theme}}"></view>')
  })
})

describe('virtualHostClass', () => {
  // 开启mergeVirtualHostAttributes
  it('virtualHostClass case 0', async () => {
    const testCase = await getWxmlCase('virtualHost-case0.wxml')
    const { templateHandler } = getOptions()
    const str = await templateHandler(testCase)
    expect(str).toMatchSnapshot()
  })

  it('mpx-tdesign-button case 0', async () => {
    const testCase = await getWxmlCase('mpx-tdesign-button.wxml')
    const { templateHandler } = getOptions()
    const str = await templateHandler(testCase)
    expect(str).toMatchSnapshot()
  })

  it('mpx-tdesign-button short case 0', async () => {
    const testCase = await getWxmlCase('mpx-tdesign-button-short.wxml')
    const { templateHandler } = getOptions()
    const str = await templateHandler(testCase)
    expect(str).toMatchSnapshot()
  })

  it('mpx-tdesign-button short case 1', async () => {
    const testCase = `<template name="icon"><t-icon style="{{style || ''}}" class="{{class}}" t-class="{{tClass}}" prefix="{{prefix || ''}}" name="{{name || ''}}" size="{{size || ''}}" color="{{color || ''}}" aria-hidden="{{ariaHidden || '' }}" aria-label="{{ariaLabel || ''}}" aria-role="{{ariaRole || ''}}" bind:click="{{bindclick || ''}}"/></template>`
    const { templateHandler } = getOptions()
    const str = await templateHandler(testCase)
    expect(str).toMatchSnapshot()
  })

  // 不开启mergeVirtualHostAttributes
  it('virtualHostClass case 1', async () => {
    const testCase = await getWxmlCase('virtualHost-case1.wxml')
    const { templateHandler } = getOptions()
    const str = await templateHandler(testCase)
    expect(str).toMatchSnapshot()
  })

  it('mpx after content double qutos', async () => {
    const x = '<view class="after:content-["你好啊，我很无聊"] after:ml-0.5 after:text-red-500"></view>'
    const { templateHandler } = getOptions()
    expect(await templateHandler(x)).toMatchSnapshot()
  })

  it('mp-html case 0', async () => {
    const testCase = await getWxmlCase('mp-html.wxml')
    const { templateHandler } = getOptions()
    const str = await templateHandler(testCase)
    expect(str).toMatchSnapshot()
  })
  it('mp-html node case 0', async () => {
    const testCase = await getWxmlCase('mp-html-node.wxml')
    const { templateHandler } = getOptions()
    const str = await templateHandler(testCase)
    expect(str).toMatchSnapshot()
  })
})
