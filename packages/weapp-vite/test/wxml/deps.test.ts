import { getDeps } from '@/utils/wxml'

describe('deps', () => {
  it('wxs case 0', () => {
    const { deps } = getDeps(`<wxs src="./../tools.wxs" module="tools" />
<view> {{tools.msg}} </view>
<view> {{tools.bar(tools.FOO)}} </view>`)
    expect(deps).toEqual([
      {
        end: 25,
        name: 'src',
        quote: '"',
        start: 5,
        tagName: 'wxs',
        value: './../tools.wxs',
      },
    ])
  })

  it('wxs case 1', () => {
    const { deps } = getDeps(`
<wxs src="./../logic.wxs" module="logic" />`)
    expect(deps).toEqual([
      {
        end: 26,
        name: 'src',
        quote: '"',
        start: 6,
        tagName: 'wxs',
        value: './../logic.wxs',
      },
    ])
  })

  it('wxs case 2', () => {
    const { deps } = getDeps(`<wxs module="foo">
var some_msg = "hello world";
module.exports = {
  msg : some_msg,
}
</wxs>
<view> {{foo.msg}} </view>`)
    expect(deps).toEqual([])
  })

  it('video case 0', () => {
    const { deps } = getDeps(`<view class="page-body">
  <view class="page-section tc">
    <video 
      id="myVideo" 
      src="http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400" 
      binderror="videoErrorCallback" 
      danmu-list="{{danmuList}}" 
      enable-danmu 
      danmu-btn 
      show-center-play-btn='{{false}}' 
      show-play-btn="{{true}}" 
      controls
      picture-in-picture-mode="{{['push', 'pop']}}"
      bindenterpictureinpicture='bindVideoEnterPictureInPicture'
      bindleavepictureinpicture='bindVideoLeavePictureInPicture'
      poster="./poster.png"
    ></video>
    <view style="margin: 30rpx auto" class="weui-label">弹幕内容</view>
    <input bindblur="bindInputBlur" class="weui-input" type="text" placeholder="在此处输入弹幕内容" />
    <button style="margin: 30rpx auto"  bindtap="bindSendDanmu" class="page-body-button" type="primary" formType="submit">发送弹幕</button>
    <navigator style="margin: 30rpx auto"  url="picture-in-picture" hover-class="other-navigator-hover">
      <button type="primary" class="page-body-button" bindtap="bindPlayVideo">小窗模式</button>
    </navigator>
  </view>
</view>`)
    expect(deps).toEqual([
      {
        end: 368,
        name: 'src',
        quote: '"',
        start: 96,
        tagName: 'video',
        value: 'http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400',
      },
      {
        end: 775,
        name: 'poster',
        quote: '"',
        start: 754,
        tagName: 'video',
        value: './poster.png',
      },
    ])
  })

  it('template import case 0', () => {
    const { deps } = getDeps(`<import src="item.wxml"/>
<template is="item" data="{{text: 'forbar'}}"/>
`)
    expect(deps).toEqual([
      {
        end: 23,
        name: 'src',
        quote: '"',
        start: 8,
        tagName: 'import',
        value: 'item.wxml',
      },
    ])
  })

  it('template import case 1', () => {
    const { deps } = getDeps(`<import src="a.wxml"/>
<template name="B">
  <text> B template </text>
</template>`)
    expect(deps).toEqual([
      {
        end: 20,
        name: 'src',
        quote: '"',
        start: 8,
        tagName: 'import',
        value: 'a.wxml',
      },
    ])
  })

  it('template include case 0', () => {
    const { deps } = getDeps(`<include src="header.wxml"/>
<view> body </view>
<include src="footer.wxml"/>`)
    expect(deps).toEqual([
      {
        end: 26,
        name: 'src',
        quote: '"',
        start: 9,
        tagName: 'include',
        value: 'header.wxml',
      },
      {
        end: 75,
        name: 'src',
        quote: '"',
        start: 58,
        tagName: 'include',
        value: 'footer.wxml',
      },
    ])
  })
})
