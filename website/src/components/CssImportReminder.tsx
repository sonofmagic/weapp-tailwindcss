import Admonition from '@theme/Admonition'
import React from 'react'

/**
 * 可复用组件：说明 @import 'tailwindcss' 自动转换为 @import 'weapp-tailwindcss' 的机制
 *
 * 使用方法：
 * import CssImportReminder from '@site/src/components/CssImportReminder';
 * <CssImportReminder />
 */
export default function CssImportReminder(): React.JSX.Element {
  return (
    <Admonition type="info" title="关于 @import 'tailwindcss'">
      <p>
        默认情况下，
        <code>weapp-tailwindcss</code>
        {' '}
        的
        {' '}
        <code>rewriteCssImports</code>
        {' '}
        选项会自动将
        <code>@import &apos;tailwindcss&apos;</code>
        {' '}
        改写为
        {' '}
        <code>@import &apos;weapp-tailwindcss/index.css&apos;</code>
        。
      </p>
      <p>
        这意味着你可以直接在项目中使用官方文档的写法
        {' '}
        <code>@import &apos;tailwindcss&apos;</code>
        ，以获得更好的
        {' '}
        <a href="/docs/quick-start/intelliSense">IDE 智能提示</a>
        {' '}
        支持。
      </p>
      <p>
        如果遇到报错或样式不生效，请手动改为
        {' '}
        <code>@import &apos;weapp-tailwindcss/index.css&apos;</code>
        ，
        或将
        <code>rewriteCssImports</code>
        {' '}
        设置为
        <code>false</code>
        。
      </p>
    </Admonition>
  )
}
