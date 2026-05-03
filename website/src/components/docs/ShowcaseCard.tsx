import { useId, useState, type ReactNode } from 'react'

type ShowcaseImage = {
  src: string
  alt?: string
}

type ShowcaseLink = {
  text: string
  url?: string
}

type ShowcaseCardProps = {
  title: string
  titleHref?: string
  authorLogin?: string
  authorUrl?: string
  createdAt: string
  commentUrl: string
  link?: ShowcaseLink
  github?: ShowcaseLink
  primaryImage: ShowcaseImage
  screenshots?: ShowcaseImage[]
  children?: ReactNode
}

function ShowcaseExternalLink({ value }: { value: ShowcaseLink }) {
  if (value.url) {
    return <a href={value.url}>{value.text}</a>
  }

  return <>{value.text}</>
}

export default function ShowcaseCard({
  title,
  titleHref,
  authorLogin,
  authorUrl,
  createdAt,
  commentUrl,
  link,
  github,
  primaryImage,
  screenshots = [],
  children,
}: ShowcaseCardProps) {
  const [expanded, setExpanded] = useState(true)
  const panelId = useId()
  const hasScreenshots = screenshots.length > 0
  const titleContent = titleHref ? <a href={titleHref}>{title}</a> : title

  return (
    <article className={`showcase-card${hasScreenshots ? ' showcase-card--with-screenshots' : ''}`}>
      <header className="showcase-card__header">
        <h3 id={title}>
          {titleContent}
          <a className="showcase-card__anchor" href={`#${title}`} aria-label={`${title} 的直接链接`}>
            #
          </a>
        </h3>
        <p className="showcase-card__meta">
          <strong>提交者：</strong>
          {authorLogin && authorUrl ? <a href={authorUrl}>@{authorLogin}</a> : '匿名'}
          <span aria-hidden="true"> · </span>
          <span>{createdAt}</span>
          <span aria-hidden="true"> · </span>
          <a href={commentUrl}>查看评论</a>
        </p>
      </header>

      {(link || github || children) ? (
        <div className="showcase-card__body">
          {link ? (
            <p>
              <strong>链接：</strong>
              <ShowcaseExternalLink value={link} />
            </p>
          ) : null}
          {github ? (
            <p>
              <strong>GitHub：</strong>
              <ShowcaseExternalLink value={github} />
            </p>
          ) : null}
          {children}
        </div>
      ) : null}

      <div className="showcase-card__media">
        <figure className="showcase-card__primary">
          {hasScreenshots ? <figcaption>小程序码</figcaption> : null}
          <img className="showcase-card__image" loading="lazy" src={primaryImage.src} alt={primaryImage.alt || title} />
        </figure>

        {hasScreenshots ? (
          <section className="showcase-card__screenshots" aria-labelledby={`${panelId}-button`}>
            <button
              id={`${panelId}-button`}
              type="button"
              className="showcase-card__toggle"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setExpanded(value => !value)}
            >
              <span className="showcase-card__caret" aria-hidden="true" />
              <span className="showcase-card__toggle-label">作品截图</span>
              <span className="showcase-card__count">（{screenshots.length} 张）</span>
            </button>

            <div id={panelId} className="showcase-card__shot-panel" hidden={!expanded}>
              <div className="showcase-card__shot-grid">
                {screenshots.map((image, index) => (
                  <img
                    key={`${image.src}-${index}`}
                    className="showcase-card__image showcase-card__shot"
                    loading="lazy"
                    src={image.src}
                    alt={image.alt || `${title} 截图 ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </article>
  )
}
