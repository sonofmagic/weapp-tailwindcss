import { templeteHandler } from '@/wxml/index'
import { format } from '../util'
import { MappingChars2String } from '@/dic'
describe('templeteHandler', () => {
  function complexHandler(str: string) {
    return templeteHandler(str, {
      escapeMap: MappingChars2String
    })
  }
  test('with var', async () => {
    const testCase = "<view class=\"{{['flex','flex-col','items-center',flag===1?'bg-red-900':'bg-[#fafa00]']}}\"></view>"

    const str = complexHandler(testCase)
    expect(str).toBe("<view class=\"{{['flex','flex-col','items-center',flag===1?'bg-red-900':'bg-_bl__h_fafa00_br_']}}\"></view>")
  })

  test('dark mode and hover-class', () => {
    const testCase = '<view class="bg-gray-100 dark:bg-zinc-800" hover-class="bg-red-500 dark:bg-green-500"></view>'
    const str = complexHandler(testCase)
    expect(str).toBe('<view class="bg-gray-100 dark_c_bg-zinc-800" hover-class="bg-red-500 dark_c_bg-green-500"></view>')
  })

  it('wxs should be ignored ', () => {
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
    const result = complexHandler(testCase)

    expect(result).toBe(testCase)
  })

  it('should ', () => {
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

    const result = complexHandler(testCase)

    expect(result).toBe(
      '<button class="    u-reset-button    rounded-full    w-10    h-10    flex    justify-center    items-center    pointer-events-auto    bg-white    shadow  " open-type="contact"><tui-icon vue-id="{{(\'17a41c02-4\')+\',\'+(\'17a41c02-3\')}}" name="kefu" color="rgb(41, 121, 255)" size="40" unit="rpx" bind:__l="__l"></tui-icon></button>'
    )
  })

  test('with var 3', () => {
    const testCase = "<view class=\"{{[flag<2?'a':'b',flag>=1?'bg-red-900':'bg-[#fafa00]']}}\"></view>"
    const res = complexHandler(testCase)
    expect(res).toBe("<view class=\"{{[flag<2?'a':'b',flag>=1?'bg-red-900':'bg-_bl__h_fafa00_br_']}}\"></view>")
  })

  test('with var 4', () => {
    const testCase = `<button id="{{ id }}" data-detail="{{ dataset }}" class="custom-class {{ utils.bem('button', [type, size, { block, round, plain, square, loading, disabled, hairline, unclickable: disabled || loading }]) }} {{ hairline ? 'van-hairline--surround' : '' }}" hover-class="van-button--active hover-class" lang="{{ lang }}" form-type="{{ formType }}" style="{{ computed.rootStyle({ plain, color, customStyle }) }}" open-type="{{ disabled || loading || (canIUseGetUserProfile && openType === 'getUserInfo') ? '' : openType }}" business-id="{{ businessId }}" session-from="{{ sessionFrom }}" send-message-title="{{ sendMessageTitle }}" send-message-path="{{ sendMessagePath }}" send-message-img="{{ sendMessageImg }}" show-message-card="{{ showMessageCard }}" app-parameter="{{ appParameter }}" aria-label="{{ ariaLabel }}" bindtap="{{ disabled || loading ? '' : 'onClick' }}" bindgetuserinfo="onGetUserInfo" bindcontact="onContact" bindgetphonenumber="onGetPhoneNumber" binderror="onError" bindlaunchapp="onLaunchApp" bindopensetting="onOpenSetting">
    </button>`

    const res = complexHandler(testCase)
    expect(res)
      .toBe(`<button id="{{ id }}" data-detail="{{ dataset }}" class="custom-class {{utils.bem('button',[type,size,{block,round,plain,square,loading,disabled,hairline,unclickable:disabled||loading}])}} {{hairline?'van-hairline--surround':''}}" hover-class="van-button--active hover-class" lang="{{ lang }}" form-type="{{ formType }}" style="{{ computed.rootStyle({ plain, color, customStyle }) }}" open-type="{{ disabled || loading || (canIUseGetUserProfile && openType === 'getUserInfo') ? '' : openType }}" business-id="{{ businessId }}" session-from="{{ sessionFrom }}" send-message-title="{{ sendMessageTitle }}" send-message-path="{{ sendMessagePath }}" send-message-img="{{ sendMessageImg }}" show-message-card="{{ showMessageCard }}" app-parameter="{{ appParameter }}" aria-label="{{ ariaLabel }}" bindtap="{{ disabled || loading ? '' : 'onClick' }}" bindgetuserinfo="onGetUserInfo" bindcontact="onContact" bindgetphonenumber="onGetPhoneNumber" binderror="onError" bindlaunchapp="onLaunchApp" bindopensetting="onOpenSetting">
    </button>`)
  })

  test('with var 2', async () => {
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
  </view>`
    )
    const str = complexHandler(navbarTestCase)
    expect(str).toBe(
      format(
        `<view data-aaa="{{aaa || 'a'}} t" disabled="true" hidden class="{{['tui-navigation-bar','data-v-ec49da2a',opacity>0.85&&splitLine?'tui-bar-line':'',isFixed?'tui-navbar-fixed':'',backdropFilter&&dropDownOpacity>0?'tui-backdrop__filter':'']}}" style="{{'height:'+(height+'px')+';'+('background-color:'+('rgba('+background+','+opacity+')')+';')+('opacity:'+(dropDownOpacity)+';')+('z-index:'+(isFixed?zIndex:'auto')+';')}}">
    <block wx:if="{{isImmersive}}">
        <view class="tui-status-bar data-v-ec49da2a" style="{{'height:'+(statusBarHeight+'px')+';'}}"></view>
    </block>
    <block wx:if="{{title&&!isCustom}}">
        <view class="tui-navigation_bar-title data-v-ec49da2a" style="{{'opacity:'+(transparent||opacity>=maxOpacity?1:opacity)+';'+('color:'+(color)+';')+('padding-top:'+(top-statusBarHeight+'px')+';')}}">
            {{''+title+''}}
        </view>
    </block>
    <slot></slot>
</view>`
      )
    )
  })

  it('class with string var', () => {
    const testCase = '<button class="btn a{{num}}" bindtap="onTap">{{num}}</button>'
    const str = complexHandler(testCase)
    expect(str).toBe(testCase)
  })

  it('utf8 test case 0', () => {
    const testCase = `<view class="{{['td',[(g.type==='你好啊')?'highlight':'']]}}">{{g.type}}</view>`
    const str = complexHandler(testCase)
    expect(str).toBe(`<view class="{{['td',[g.type==='你好啊'?'highlight':'']]}}">{{g.type}}</view>`)
  })

  it('utf8 test case 1', () => {
    const testCase = `<view class="{{[[g['人生']==='你好啊'?'highlight':'']]}}">{{g.type}}</view>`
    const str = complexHandler(testCase)
    expect(str).toBe(testCase)
  })
})
