import Admonition from '@theme/Admonition'
import React from 'react'

/**
 * 可复用组件：说明生成模式下 @import 'tailwindcss' 与存量 weapp-tailwindcss 入口的关系
 *
 * 使用方法：
 * import CssImportReminder from '@site/src/components/CssImportReminder';
 * <CssImportReminder />
 */
export default function CssImportReminder(): React.JSX.Element {
  return (
    <Admonition type="info" title="关于 @import 'tailwindcss'">
      <p>
        v5 生成模式下，推荐在 Tailwind CSS v4 入口里直接写
        {' '}
        <code>@import &apos;tailwindcss&apos;</code>
        。
        <code>WeappTailwindcss</code>
        {' '}
        会根据
        {' '}
        <code>target: &apos;weapp&apos;</code>
        {' '}
        生成小程序目标 CSS。
      </p>
      <p>
        这也能继续复用官方文档和 IntelliSense 识别的写法
        {' '}
        <code>@import &apos;tailwindcss&apos;</code>
        ，以获得更好的
        {' '}
        <a href="/docs/quick-start/intelliSense">IDE 智能提示</a>
        {' '}
        支持。
      </p>
      <p>
        存量项目中已经存在的
        {' '}
        <code>@import &apos;weapp-tailwindcss/index.css&apos;</code>
        {' '}
        仍然可以继续使用，适合暂时不调整 CSS 入口的 v4 项目。
      </p>
      <p>
        不论使用哪种入口，都请确保
        {' '}
        <code>cssEntries</code>
        {' '}
        指向纯
        {' '}
        <code>.css</code>
        {' '}
        文件，并且不要额外注册
        {' '}
        <code>@tailwindcss/postcss</code>
        {' '}
        或
        {' '}
        <code>@tailwindcss/vite</code>
        。
      </p>
    </Admonition>
  )
}
