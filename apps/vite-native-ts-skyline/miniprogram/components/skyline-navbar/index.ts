type TrendPoint = number

interface SkylineNavbarInstance extends WechatMiniprogram.Component.TrivialInstance {
  __timer?: number
}

const defaultTrend: TrendPoint[] = [42, 68, 54, 92, 78, 118, 88]

function formatTime() {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    title: {
      type: String,
      value: 'Skyline Hub',
    },
    location: {
      type: String,
      value: '深圳 · Skyline District',
    },
    weather: {
      type: String,
      value: '晴 · 26°C',
    },
    trend: {
      type: Array,
      value: defaultTrend,
    },
  },
  data: {
    currentTime: formatTime(),
    trendBars: [] as Array<{ height: number, label: string }>,
  },
  lifetimes: {
    attached() {
      this.updateTime()
      this.updateTrend(this.properties.trend as TrendPoint[])
      ;(this as SkylineNavbarInstance).__timer = setInterval(() => {
        this.updateTime()
      }, 60000) as unknown as number
    },
    detached() {
      const instance = this as SkylineNavbarInstance
      if (typeof instance.__timer === 'number') {
        clearInterval(instance.__timer)
        delete instance.__timer
      }
    },
  },
  observers: {
    trend(value: TrendPoint[]) {
      this.updateTrend(value)
    },
  },
  methods: {
    updateTime() {
      this.setData({
        currentTime: formatTime(),
      })
    },
    updateTrend(trend: TrendPoint[]) {
      if (!Array.isArray(trend) || trend.length === 0) {
        this.setData({ trendBars: [] })
        return
      }

      const max = Math.max(...trend)
      const min = Math.min(...trend)
      const range = Math.max(max - min, 1)

      const normalized = trend.map((value, index) => {
        const height = Math.round(((value - min) / range) * 55 + 45)
        return {
          height,
          label: `T${index + 1}`,
        }
      })

      this.setData({
        trendBars: normalized,
      })
    },
    handlePrimaryTap() {
      this.triggerEvent('primarytap')
    },
  },
})
