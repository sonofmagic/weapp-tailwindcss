import { geoMeta as defaultGeoMeta } from '@site/config/siteMetadata'

export type GeoMeta = typeof defaultGeoMeta

export type PartialGeoMeta = Partial<GeoMeta> | null | undefined

export function resolveGeoMeta(geo?: PartialGeoMeta): GeoMeta {
  if (!geo) {
    return defaultGeoMeta
  }
  return {
    ...defaultGeoMeta,
    ...geo,
  }
}

export function extractGeoCoordinates(meta: GeoMeta) {
  const parts = (meta.position || '').split(';').map(item => item.trim()).filter(Boolean)
  if (parts.length !== 2) {
    return null
  }
  const [latitude, longitude] = parts
  return {
    latitude,
    longitude,
  }
}

export function toAbsoluteUrl(siteUrl: string, value?: string | null) {
  if (!value) {
    return undefined
  }
  if (value.startsWith('http')) {
    return value
  }
  try {
    return new URL(value, siteUrl).toString()
  }
  catch {
    return undefined
  }
}
