import type { PartialGeoMeta } from '@site/src/utils/geo'

import Head from '@docusaurus/Head'
import { useBlogPost } from '@docusaurus/plugin-content-blog/client'
import { siteLanguage, siteName, siteUrl, socialImageUrl } from '@site/config/siteMetadata'
import { extractGeoCoordinates, resolveGeoMeta, toAbsoluteUrl } from '@site/src/utils/geo'
import OriginalHead from '@theme-original/BlogPostPage/Head'
import React from 'react'

interface FrontMatterWithGeo {
  geo?: PartialGeoMeta
  category?: string
  lang?: string
  image?: string
}

type BlogPostPageHeadProps = React.ComponentProps<typeof OriginalHead>

export default function BlogPostPageHead(props: BlogPostPageHeadProps) {
  const { metadata, frontMatter } = useBlogPost()
  const geo = resolveGeoMeta((frontMatter as FrontMatterWithGeo | undefined)?.geo)
  const coordinates = extractGeoCoordinates(geo)

  const canonicalUrl = toAbsoluteUrl(siteUrl, metadata.permalink) || `${siteUrl}${metadata.permalink}`
  const imageUrl = toAbsoluteUrl(siteUrl, metadata.image ?? frontMatter?.image) || socialImageUrl
  const publishedTime = metadata.date
  const modifiedTime = metadata.modifiedDate ?? metadata.date
  const articleSection = frontMatter?.category ?? metadata.tags?.[0]?.label ?? 'Blog'
  const language = frontMatter?.lang ?? siteLanguage

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': metadata.title,
    'description': metadata.description ?? metadata.excerpt,
    'image': imageUrl ? [imageUrl] : undefined,
    'datePublished': publishedTime,
    'dateModified': modifiedTime,
    'inLanguage': language,
    'mainEntityOfPage': canonicalUrl,
    'url': canonicalUrl,
    'keywords': metadata.tags?.map(tag => tag.label),
    'author': metadata.authors
      ?.filter((author): author is NonNullable<typeof author> => Boolean(author?.name || author?.url))
      ?.map(author => ({
        '@type': 'Person',
        'name': author.name,
        'url': author.url,
      })),
    'publisher': {
      '@type': 'Organization',
      'name': siteName,
      'logo': {
        '@type': 'ImageObject',
        'url': socialImageUrl,
      },
    },
    'contentLocation': coordinates
      ? {
          '@type': 'Place',
          'address': {
            '@type': 'PostalAddress',
            'addressCountry': geo.region,
            'addressLocality': geo.placename,
          },
          'geo': {
            '@type': 'GeoCoordinates',
            'latitude': coordinates.latitude,
            'longitude': coordinates.longitude,
          },
        }
      : undefined,
  }

  return (
    <>
      <OriginalHead {...props} />
      <Head>
        <meta name="geo.region" content={geo.region} />
        <meta name="geo.placename" content={geo.placename} />
        <meta name="geo.position" content={geo.position} />
        <meta name="ICBM" content={geo.icbm} />
        <meta property="article:section" content={articleSection} />
        {publishedTime && <meta property="article:published_time" content={publishedTime} />}
        {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        {metadata.tags?.map(tag => (
          <meta key={tag.permalink ?? tag.label} property="article:tag" content={tag.label} />
        ))}
        {language && <meta httpEquiv="Content-Language" content={language} />}
        <script type="application/ld+json">
          {JSON.stringify(articleJsonLd)}
        </script>
      </Head>
    </>
  )
}
