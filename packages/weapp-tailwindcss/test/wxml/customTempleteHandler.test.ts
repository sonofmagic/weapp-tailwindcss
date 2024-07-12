// @ts-nocheck
import { createGetCase, format, wxmlCasePath } from '../util'
import { customTemplateHandler } from '@/wxml/utils'
import { SimpleMappingChars2String } from '@/escape'

const getCase = createGetCase(wxmlCasePath)
describe('customTemplateHandler', () => {
  it('invalid customAttributesEntities options', async () => {
    const res = await customTemplateHandler('<view class="p-[20px]"></view>', {
      customAttributesEntities: [],
      escapeMap: SimpleMappingChars2String,
    })
    expect(res).toBe('<view class="p-_20px_"></view>')
  })

  it('disabledDefaultTemplateHandler case 0', async () => {
    const testCase = '<view class="p-[20px]" hover-class="w-[99px]"></view>'
    const res = await customTemplateHandler(testCase, {
      customAttributesEntities: [],
      disabledDefaultTemplateHandler: true,
    })
    expect(res).toBe(testCase)
  })

  it('disabledDefaultTemplateHandler case 1', async () => {
    const testCase = '<view class="p-[20px]" hover-class="w-[99px]"></view>'
    // 'p-[20px] hover-class='
    const res = await customTemplateHandler(testCase, {
      customAttributesEntities: [['*', /[A-Za-z-]*[Cc]lass/]],
      disabledDefaultTemplateHandler: true,
    })
    expect(res).toBe('<view class="p-_20px_" hover-class="w-_99px_"></view>')
  })

  it('{{}} case 0', async () => {
    const testCase = '<view class="p-[20px]{{a>0}}" hover-class="w-[99px]{{a>0}}"  ccc sdsd="" sadf="{{fd<3||0>1}}">{{fd<3||0>1}}</view>'
    // 'p-[20px] hover-class='
    const res = await customTemplateHandler(testCase, {
      disabledDefaultTemplateHandler: false,
    })
    expect(res).toBe('<view class="p-_20px_{{a>0}}" hover-class="w-_99px_{{a>0}}"  ccc sdsd="" sadf="{{fd<3||0>1}}">{{fd<3||0>1}}</view>')
  })

  it('wildcard char', async () => {
    const testCase = '<view class="{{[\'flex\',\'flex-col\',\'items-center\',flag===1?\'bg-red-900\':\'bg-[#fafa00]\']}}">*****</view>'

    const str = await customTemplateHandler(testCase)
    expect(str).toBe('<view class="{{[\'flex\',\'flex-col\',\'items-center\',flag===1?\'bg-red-900\':\'bg-_hfafa00_\']}}">*****</view>')
  })

  it('only wildcard char', async () => {
    const testCase = '<view>*****</view>'

    const str = await customTemplateHandler(testCase)
    expect(str).toBe('<view>*****</view>')
  })
  it('with var', async () => {
    const testCase = '<view class="{{[\'flex\',\'flex-col\',\'items-center\',flag===1?\'bg-red-900\':\'bg-[#fafa00]\']}}"></view>'

    const str = await customTemplateHandler(testCase)
    expect(str).toBe('<view class="{{[\'flex\',\'flex-col\',\'items-center\',flag===1?\'bg-red-900\':\'bg-_hfafa00_\']}}"></view>')
  })

  it('dark mode and hover-class', async () => {
    const testCase = '<view class="bg-gray-100 dark:bg-zinc-800" hover-class="bg-red-500 dark:bg-green-500"></view>'
    const str = await customTemplateHandler(testCase)
    expect(str).toBe('<view class="bg-gray-100 darkcbg-zinc-800" hover-class="bg-red-500 darkcbg-green-500"></view>')
  })

  it('wxs should be ignored ', async () => {
    const testCase = `<wxs module="status">
    function get(index, active) {
      if (index < active) {
        return 'finish';
      } else if (index === active) {
        return 'process';
      }

      return 'inactive';
    }

    module.exports = get;
    </wxs>`
    const result = await customTemplateHandler(testCase)

    expect(result).toBe(testCase)
  })

  it('should ', async () => {
    const testCase = `<button class="
    u-reset-button
    rounded-full
    w-10
    h-10
    flex
    justify-center
    items-center
    pointer-events-auto
    bg-white
    shadow
  " open-type="contact"><tui-icon vue-id="{{('17a41c02-4')+','+('17a41c02-3')}}" name="kefu" color="rgb(41, 121, 255)" size="40" unit="rpx" bind:__l="__l"></tui-icon></button>`

    const result = await customTemplateHandler(testCase)

    expect(result).toBe(
      '<button class="    u-reset-button    rounded-full    w-10    h-10    flex    justify-center    items-center    pointer-events-auto    bg-white    shadow  " open-type="contact"><tui-icon vue-id="{{(\'17a41c02-4\')+\',\'+(\'17a41c02-3\')}}" name="kefu" color="rgb(41, 121, 255)" size="40" unit="rpx" bind:__l="__l"></tui-icon></button>',
    )
  })

  it('with var 3', async () => {
    const testCase = '<view class="{{[flag<2?\'a\':\'b\',flag>=1?\'bg-red-900\':\'bg-[#fafa00]\']}}"></view>'
    const res = await customTemplateHandler(testCase)
    expect(res).toBe('<view class="{{[flag<2?\'a\':\'b\',flag>=1?\'bg-red-900\':\'bg-_hfafa00_\']}}"></view>')
  })

  it('with var 4', async () => {
    const testCase = `
    <button id="{{ id }}" data-detail="{{ dataset }}" class="custom-class {{ utils.bem('button', [type, size, { block, round, plain, square, loading, disabled, hairline, unclickable: disabled || loading }]) }} {{ hairline ? 'van-hairline--surround' : '' }}" hover-class="van-button--active hover-class" lang="{{ lang }}" form-type="{{ formType }}" style="{{ computed.rootStyle({ plain, color, customStyle }) }}" open-type="{{ disabled || loading || (canIUseGetUserProfile && openType === 'getUserInfo') ? '' : openType }}" business-id="{{ businessId }}" session-from="{{ sessionFrom }}" send-message-title="{{ sendMessageTitle }}" send-message-path="{{ sendMessagePath }}" send-message-img="{{ sendMessageImg }}" show-message-card="{{ showMessageCard }}" app-parameter="{{ appParameter }}" aria-label="{{ ariaLabel }}" bindtap="{{ disabled || loading ? '' : 'onClick' }}" bindgetuserinfo="onGetUserInfo" bindcontact="onContact" bindgetphonenumber="onGetPhoneNumber" binderror="onError" bindlaunchapp="onLaunchApp" bindopensetting="onOpenSetting">`

    const res = await customTemplateHandler(testCase)
    expect(res).toBe(testCase)
  })

  it('with var 2', async () => {
    const navbarTestCase = format(
      `<view data-aaa="{{aaa || 'a'}} t" disabled="true" hidden class="{{['tui-navigation-bar','data-v-ec49da2a',(opacity>0.85&&splitLine)?'tui-bar-line':'',(isFixed)?'tui-navbar-fixed':'',(backdropFilter&&dropDownOpacity>0)?'tui-backdrop__filter':'']}}" style="{{'height:'+(height+'px')+';'+('background-color:'+('rgba('+background+','+opacity+')')+';')+('opacity:'+(dropDownOpacity)+';')+('z-index:'+(isFixed?zIndex:'auto')+';')}}">
      <block wx:if="{{isImmersive}}">
          <view class="tui-status-bar data-v-ec49da2a" style="{{'height:'+(statusBarHeight+'px')+';'}}"></view>
      </block>
      <block wx:if="{{title&&!isCustom}}">
          <view class="tui-navigation_bar-title data-v-ec49da2a" style="{{'opacity:'+(transparent||opacity>=maxOpacity?1:opacity)+';'+('color:'+(color)+';')+('padding-top:'+(top-statusBarHeight+'px')+';')}}">
              {{''+title+''}}
          </view>
      </block>
      <slot></slot>
  </view>`,
    )
    const str = await customTemplateHandler(navbarTestCase)
    expect(str).toBe(
      format(
        `<view data-aaa="{{aaa || 'a'}} t" disabled="true" hidden class="{{['tui-navigation-bar','data-v-ec49da2a',(opacity>0.85&&splitLine)?'tui-bar-line':'',(isFixed)?'tui-navbar-fixed':'',(backdropFilter&&dropDownOpacity>0)?'tui-backdrop__filter':'']}}" style="{{'height:'+(height+'px')+';'+('background-color:'+('rgba('+background+','+opacity+')')+';')+('opacity:'+(dropDownOpacity)+';')+('z-index:'+(isFixed?zIndex:'auto')+';')}}">
    <block wx:if="{{isImmersive}}">
        <view class="tui-status-bar data-v-ec49da2a" style="{{'height:'+(statusBarHeight+'px')+';'}}"></view>
    </block>
    <block wx:if="{{title&&!isCustom}}">
        <view class="tui-navigation_bar-title data-v-ec49da2a" style="{{'opacity:'+(transparent||opacity>=maxOpacity?1:opacity)+';'+('color:'+(color)+';')+('padding-top:'+(top-statusBarHeight+'px')+';')}}">
            {{''+title+''}}
        </view>
    </block>
    <slot></slot>
</view>`,
      ),
    )
  })

  it('class with string var', async () => {
    const testCase = '<button class="btn a{{num}}" bindtap="onTap">{{num}}</button>'
    const str = await customTemplateHandler(testCase)
    expect(str).toBe(testCase)
  })

  it('utf8 test case 0', async () => {
    const testCase = `<view class="{{['td',[(g.type==='你好啊')?'highlight':'']]}}">{{g.type}}</view>`
    const str = await customTemplateHandler(testCase)
    expect(str).toBe(`<view class="{{['td',[(g.type==='你好啊')?'highlight':'']]}}">{{g.type}}</view>`)
  })

  it('utf8 test case 1', async () => {
    const testCase = `<view class="{{[[g['人生']==='你好啊'?'highlight':'']]}}">{{g.type}}</view>`
    const str = await customTemplateHandler(testCase)
    expect(str).toBe(testCase)
  })

  it('after wx:if <view wx:if="{{xxx}}" class="ml-[16px]">', async () => {
    const testCase = '<view wx:if="{{xxx}}" class="ml-[16px]">'
    const str = await customTemplateHandler(testCase)
    expect(str).toBe('<view wx:if="{{xxx}}" class="ml-_16px_">')
  })

  it('before wx:if <view  class="ml-[16px]" wx:if="{{xxx}}">', async () => {
    const testCase = '<view class="ml-[16px]" wx:if="{{xxx}}">'
    const str = await customTemplateHandler(testCase)
    expect(str).toBe('<view class="ml-_16px_" wx:if="{{xxx}}">')
  })

  it('wx:if > before', async () => {
    const testCase = '<view class="mt-[8px]" wx:if="{{ xxx.length > 0 }}">'
    const str = await customTemplateHandler(testCase)
    expect(str).toBe('<view class="mt-_8px_" wx:if="{{ xxx.length > 0 }}">')
  })
  it('wx:if > after', async () => {
    const testCase = '<view wx:if="{{ xxx.length > 0 }}" class="mt-[8px]">'
    const str = await customTemplateHandler(testCase)
    expect(str).toBe('<view wx:if="{{ xxx.length > 0 }}" class="mt-_8px_">')
  })

  it('mpx-wxs case', async () => {
    const testCase = await getCase('mpx-wxs.wxml')
    const str = await customTemplateHandler(testCase)
    expect(str).toMatchSnapshot()
  })
})
