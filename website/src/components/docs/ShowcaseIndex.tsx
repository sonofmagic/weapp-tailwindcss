import { useCurrentSiteLocale } from '@site/src/i18n/runtime'

type ShowcaseIndexItem = {
  title: string
  href: string
  createdAt: string
  authorLogin?: string
  screenshotCount: number
  hasLink: boolean
  hasGithub: boolean
}

type ShowcaseIndexProps = {
  issueUrl: string
  generatedAt: string
  items: ShowcaseIndexItem[]
}

export default function ShowcaseIndex({ issueUrl, generatedAt, items }: ShowcaseIndexProps) {
  const locale = useCurrentSiteLocale()
  const totalScreenshots = items.reduce((total, item) => total + item.screenshotCount, 0)

  return (
    <section className="showcase-index" aria-labelledby="showcase-index-heading">
      <div className="showcase-index__summary">
        <p className="showcase-index__eyebrow">Showcase</p>
        <h2 id="showcase-index-heading">
          {locale === 'en' ? `${items.length} mini app showcases collected` : `已收录 ${items.length} 个小程序案例`}
        </h2>
        <p>
          {locale === 'en' ? 'Data comes from ' : '数据来自 '}
          <a href={issueUrl}>{locale === 'en' ? 'Who is using weapp-tailwindcss' : '谁在使用 weapp-tailwindcss'}</a>
          {locale === 'en' ? `, last synced: ${generatedAt}.` : `，最近同步：${generatedAt}。`}
        </p>
        <dl className="showcase-index__stats">
          <div>
            <dt>{locale === 'en' ? 'Cases' : '案例'}</dt>
            <dd>{items.length}</dd>
          </div>
          <div>
            <dt>{locale === 'en' ? 'Screenshots' : '截图'}</dt>
            <dd>{totalScreenshots}</dd>
          </div>
        </dl>
      </div>

      <nav className="showcase-index__list" aria-label={locale === 'en' ? 'Mini app showcase index' : '小程序案例索引'}>
        {items.map(item => (
          <a className="showcase-index__item" href={item.href} key={item.href}>
            <span className="showcase-index__item-title">{item.title}</span>
            <span className="showcase-index__item-meta">
              {item.createdAt}
              {item.authorLogin ? ` / @${item.authorLogin}` : ''}
            </span>
            <span className="showcase-index__item-tags" aria-label={locale === 'en' ? 'Resource types' : '资源类型'}>
              <span>{item.screenshotCount > 0 ? (locale === 'en' ? `${item.screenshotCount} screenshots` : `${item.screenshotCount} 张截图`) : (locale === 'en' ? 'QR only' : '仅小程序码')}</span>
              {item.hasLink ? <span>{locale === 'en' ? 'Website' : '官网'}</span> : null}
              {item.hasGithub ? <span>GitHub</span> : null}
            </span>
          </a>
        ))}
      </nav>
    </section>
  )
}
