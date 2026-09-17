import { PNG } from 'pngjs'
import { describe, expect, it } from 'vitest'
import { countMarkerPixelChanges, locateMarkerColor } from '../scripts/demo-visual-e2e-report/app-marker-visual'

const color = { red: 16, green: 41, blue: 56 }
function screenshot(rectangles: number[][]) {
  const image = new PNG({ width: 220, height: 160 })
  image.data.fill(255)
  for (const [left, top, width, height] of rectangles) {
    for (let y = top!; y < top! + height!; y++) {
      for (let x = left!; x < left! + width!; x++) {
        const offset = (y * image.width + x) * 4
        image.data[offset] = color.red
        image.data[offset + 1] = color.green
        image.data[offset + 2] = color.blue
      }
    }
  }
  return image
}

describe('App marker visual evidence', () => {
  it('separates same-color unrelated regions using declared marker geometry', () => {
    const marker = locateMarkerColor(screenshot([[10, 10, 80, 20], [20, 100, 150, 10]]), color, 'w-[80px] h-[20px]')
    expect(marker.matched).toBe(true)
    expect(marker.bounds).toEqual({ minX: 10, minY: 10, maxX: 89, maxY: 29 })
  })

  it('rejects absent and ambiguous markers', () => {
    expect(locateMarkerColor(screenshot([]), color, 'w-[80px] h-[20px]').matched).toBe(false)
    expect(locateMarkerColor(screenshot([[10, 10, 80, 20], [10, 80, 80, 20]]), color, 'w-[80px] h-[20px]').matched).toBe(false)
  })

  it('accepts same-color movement without requiring more pixels, and rejects unchanged markers', () => {
    const before = screenshot([[10, 10, 80, 20]])
    const after = screenshot([[10, 50, 80, 20]])
    const a = locateMarkerColor(before, color, 'w-[80px] h-[20px]')
    const b = locateMarkerColor(after, color, 'w-[80px] h-[20px]')
    expect(a.matchingPixels).toBe(b.matchingPixels)
    expect(countMarkerPixelChanges(before, after, color, a.bounds!, b.bounds!)).toBe(3200)
    expect(countMarkerPixelChanges(before, before, color, a.bounds!, a.bounds!)).toBe(0)
  })
})
