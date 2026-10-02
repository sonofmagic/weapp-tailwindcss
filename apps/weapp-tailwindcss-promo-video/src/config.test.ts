import { describe, expect, it } from 'vitest'
import { films, FORMATS, FPS, getFormat, sceneAtFrame } from './config'

describe('双比例剪辑时间轴', () => {
  for (const format of FORMATS) {
    it(`${format} 每帧恰好属于一个场景，片尾保留阅读时间`, () => {
      const film = films[format]
      expect(film.width / film.height).toBeCloseTo(format === 'landscape' ? 16 / 9 : 9 / 16)
      expect(film.seconds).toBe(format === 'landscape' ? 60 : 30)
      for (let frame = 0; frame < film.seconds * FPS; frame++) {
        const covering = film.scenes.filter(scene => frame >= scene.from * FPS && frame < (scene.from + scene.duration) * FPS)
        expect(covering).toHaveLength(1)
        expect(sceneAtFrame(format, frame)?.id).toBe(covering[0].id)
      }
      const last = film.scenes.at(-1)!
      expect(last.id).toBe('cta')
      expect(last.duration).toBeGreaterThanOrEqual(4)
      expect(last.from + last.duration).toBe(film.seconds)
      expect(sceneAtFrame(format, film.seconds * FPS)).toBeUndefined()
    })
  }
  it('横竖版独立剪辑且无隐式错误画幅', () => {
    expect(films.landscape.scenes.map(scene => scene.id)).toContain('pipeline')
    expect(films.portrait.scenes.map(scene => scene.id)).not.toContain('pipeline')
    expect(() => getFormat('square')).toThrow()
    expect(getFormat('portrait')).toBe('portrait')
  })
})
