import Link from '@docusaurus/Link'
import React from 'react'

import { tailwindTopicData, type TailwindTopicCard } from './tailwindTopicData'

function TopicCard({ card }: { card: TailwindTopicCard }) {
  const isExternal = Boolean(card.href?.startsWith('http'))
  const content = (
    <>
      <div className="tailwind-topic-card__icon-wrap">
        <span className={`tailwind-topic-card__icon ${card.icon}`} aria-hidden="true" />
      </div>
      <div className="tailwind-topic-card__body">
        <div className="tailwind-topic-card__head">
          <strong>{card.title}</strong>
          {card.badge ? <span className="tailwind-topic-card__badge">{card.badge}</span> : null}
        </div>
        <p>{card.description}</p>
      </div>
    </>
  )

  if (!card.href) {
    return <article className="tailwind-topic-card">{content}</article>
  }

  return (
    <Link
      className="tailwind-topic-card tailwind-topic-card--link"
      href={card.href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer' : undefined}
    >
      {content}
    </Link>
  )
}

interface TailwindTopicHeroProps {
  title: string
  topicId: string
}

export default function TailwindTopicHero({ title, topicId }: TailwindTopicHeroProps) {
  const topic = tailwindTopicData[topicId]

  if (!topic) {
    return null
  }

  return (
    <section className="tailwind-topic-hero">
      <div className="tailwind-topic-hero__intro">
        <span className="tailwind-topic-hero__eyebrow">{topic.eyebrow}</span>
        <h2 className="tailwind-topic-hero__title">{title}</h2>
        <p className="tailwind-topic-hero__summary">{topic.summary}</p>
        <div className="tailwind-topic-hero__highlights">
          {topic.highlights.map(item => (
            <span key={item} className="tailwind-topic-hero__pill">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="tailwind-topic-hero__grid">
        {topic.packages?.length ? (
          <section className="tailwind-topic-panel">
            <div className="tailwind-topic-panel__heading">
              <span className="icon-[mdi--package-variant-closed] tailwind-topic-panel__heading-icon" aria-hidden="true" />
              <div>
                <h3>相关第三方包</h3>
                <p>本页涉及到的生态工具、库和构建底座。</p>
              </div>
            </div>
            <div className="tailwind-topic-panel__cards">
              {topic.packages.map(card => (
                <TopicCard key={card.title} card={card} />
              ))}
            </div>
          </section>
        ) : null}

        {topic.solutions?.length ? (
          <section className="tailwind-topic-panel">
            <div className="tailwind-topic-panel__heading">
              <span className="icon-[mdi--lightbulb-on-outline] tailwind-topic-panel__heading-icon" aria-hidden="true" />
              <div>
                <h3>相关解决方案</h3>
                <p>建议连读的章节、配套方法和工程落点。</p>
              </div>
            </div>
            <div className="tailwind-topic-panel__cards">
              {topic.solutions.map(card => (
                <TopicCard key={card.title} card={card} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  )
}
