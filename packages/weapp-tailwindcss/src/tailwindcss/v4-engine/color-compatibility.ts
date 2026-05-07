const OK_COLOR_FUNCTION_RE = /\boklch\(([^()]*)\)|\boklab\(([^()]*)\)/gi
const RGB_PRECISION = 1000

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function round(value: number, precision = RGB_PRECISION) {
  return Math.round(value * precision) / precision
}

function parseNumber(value: string) {
  const normalized = value.trim()
  if (normalized.endsWith('%')) {
    const numberValue = Number.parseFloat(normalized.slice(0, -1))
    return Number.isFinite(numberValue) ? numberValue / 100 : undefined
  }
  const numberValue = Number.parseFloat(normalized)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

function parseHue(value: string) {
  const normalized = value.trim()
  const numberValue = Number.parseFloat(normalized)
  if (!Number.isFinite(numberValue)) {
    return undefined
  }
  if (normalized.endsWith('turn')) {
    return numberValue * 360
  }
  if (normalized.endsWith('rad')) {
    return numberValue * 180 / Math.PI
  }
  if (normalized.endsWith('grad')) {
    return numberValue * 0.9
  }
  return numberValue
}

function parseAlpha(value: string | undefined) {
  if (!value) {
    return undefined
  }
  return parseNumber(value)
}

function parseColorFunctionArguments(value: string) {
  const [colorPart, alphaPart] = value.split('/').map(part => part.trim())
  const channels = colorPart.split(/\s+/).filter(Boolean)
  return {
    channels,
    alpha: parseAlpha(alphaPart),
  }
}

function gammaEncode(value: number) {
  return value <= 0.0031308
    ? value * 12.92
    : 1.055 * value ** (1 / 2.4) - 0.055
}

function oklabToRgb(lightness: number, a: number, b: number) {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.2914855480 * b) ** 3

  return [
    clamp(gammaEncode(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)),
    clamp(gammaEncode(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)),
    clamp(gammaEncode(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)),
  ] as const
}

function formatRgb(rgb: readonly [number, number, number], alpha: number | undefined) {
  const channels = rgb.map(channel => Math.round(channel * 255))
  const normalizedAlpha = alpha === undefined ? undefined : clamp(alpha)
  if (normalizedAlpha === undefined || normalizedAlpha === 1) {
    return `rgb(${channels[0]} ${channels[1]} ${channels[2]})`
  }
  return `rgb(${channels[0]} ${channels[1]} ${channels[2]} / ${round(normalizedAlpha)})`
}

function convertOklch(value: string) {
  const { channels, alpha } = parseColorFunctionArguments(value)
  if (channels.length < 3) {
    return undefined
  }
  const lightness = parseNumber(channels[0])
  const chroma = parseNumber(channels[1])
  const hue = parseHue(channels[2])
  if (lightness === undefined || chroma === undefined || hue === undefined) {
    return undefined
  }
  const hueRadians = hue * Math.PI / 180
  return formatRgb(
    oklabToRgb(lightness, chroma * Math.cos(hueRadians), chroma * Math.sin(hueRadians)),
    alpha,
  )
}

function convertOklab(value: string) {
  const { channels, alpha } = parseColorFunctionArguments(value)
  if (channels.length < 3) {
    return undefined
  }
  const lightness = parseNumber(channels[0])
  const a = parseNumber(channels[1])
  const b = parseNumber(channels[2])
  if (lightness === undefined || a === undefined || b === undefined) {
    return undefined
  }
  return formatRgb(oklabToRgb(lightness, a, b), alpha)
}

export function lowerModernColorFunctionsForMiniProgram(css: string) {
  return css.replace(OK_COLOR_FUNCTION_RE, (match, oklchValue, oklabValue) => {
    const converted = oklchValue === undefined
      ? convertOklab(oklabValue)
      : convertOklch(oklchValue)
    return converted ?? match
  })
}
