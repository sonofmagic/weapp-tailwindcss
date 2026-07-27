import Link from '@docusaurus/Link'
import { useCurrentSiteLocale } from '@site/src/i18n/runtime'
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
  const locale = useCurrentSiteLocale()

  return (
    <Admonition type="info" title={locale === 'en' ? 'About @import \'tailwindcss\'' : '关于 @import \'tailwindcss\''}>
      <p>
        {locale === 'en'
          ? 'In generator mode, we recommend writing '
          : '生成模式下，推荐在 Tailwind CSS 4.x 入口里直接写'}
        {' '}
        <code>@import &apos;tailwindcss&apos;</code>
        {locale === 'en' ? '.' : '。'}
        <code>WeappTailwindcss</code>
        {' '}
        {locale === 'en' ? 'will generate mini app target CSS based on ' : '会根据'}
        {' '}
        <code>target: &apos;weapp&apos;</code>
        {locale === 'en' ? '.' : ' 生成小程序目标 CSS。'}
      </p>
      <p>
        {locale === 'en'
          ? 'This also keeps the official docs and IntelliSense-friendly form of '
          : '这也能继续复用官方文档和 IntelliSense 识别的写法'}
        {' '}
        <code>@import &apos;tailwindcss&apos;</code>
        {locale === 'en' ? ' so you can get better ' : '，以获得更好的'}
        {' '}
        <Link to="/docs/quick-start/intelliSense">{locale === 'en' ? 'IDE IntelliSense' : 'IDE 智能提示'}</Link>
        {' '}
        {locale === 'en' ? 'support.' : '支持。'}
      </p>
      <p>
        {locale === 'en'
          ? 'Existing projects can still keep using '
          : '存量项目中已经存在的'}
        {' '}
        <code>@import &apos;weapp-tailwindcss/index.css&apos;</code>
        {locale === 'en'
          ? ' when you do not want to change the CSS entry yet in a v4 project.'
          : ' 仍然可以继续使用，适合暂时不调整 CSS 入口的 v4 项目。'}
      </p>
      <p>
        {locale === 'en'
          ? 'No matter which entry you use, make sure '
          : '不论使用哪种入口，都请确保'}
        {' '}
        <code>cssEntries</code>
        {' '}
        {locale === 'en' ? 'points to a pure ' : '指向纯'}
        {' '}
        <code>.css</code>
        {' '}
        {locale === 'en' ? 'file, and do not register extra ' : '文件，并且不要额外注册'}
        {' '}
        <code>@tailwindcss/postcss</code>
        {' '}
        {locale === 'en' ? 'or ' : '或'}
        {' '}
        <code>@tailwindcss/vite</code>
        {locale === 'en' ? '.' : '。'}
      </p>
    </Admonition>
  )
}
