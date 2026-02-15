import { defineComponent, reactive, ref } from 'wevu'

const WEATHER_PRESETS = [
  '晴 · 26°C',
  '多云 · 24°C',
  '阵雨 · 22°C',
  '微风 · 25°C',
]

function formatClock() {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export default defineComponent({
  setup() {
    const skylineNav = reactive({
      title: 'Skyline Market',
      location: '深圳 · 夜景塔群',
      weather: '晴 · 26°C',
      status: '营业中',
      trend: [48, 76, 58, 102, 96, 132, 118] as number[],
      trendDelta: 0,
    })
    const trendInsight = reactive({
      peak: '0',
      average: '0',
      momentum: '▲ +0%',
    })
    const statusMessage = ref('夜间流量平稳，适合补货热门商品。')
    const lastUpdated = ref(formatClock())
    const pulseBoost = ref(false)

    function refreshTrendInsight() {
      const values = skylineNav.trend
      const peak = Math.max(...values)
      const average = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
      const delta = values[values.length - 1] - values[0]
      const momentumPrefix = delta >= 0 ? '▲ +' : '▼ '
      skylineNav.trendDelta = delta
      trendInsight.peak = `${peak}`
      trendInsight.average = `${average}`
      trendInsight.momentum = `${momentumPrefix}${Math.abs(delta)}`
    }

    function runPulse() {
      pulseBoost.value = true
      setTimeout(() => {
        pulseBoost.value = false
      }, 520)
    }

    function goToCart() {
      wx.navigateTo({
        url: '/pages/cart/index',
      })
    }

    function refreshTrend(showToast = true) {
      const nextTrend = skylineNav.trend.map((value, index) => {
        const drift = Math.round((Math.random() - 0.42) * 24)
        const floor = 44 + index * 5
        return Math.max(floor, value + drift)
      })
      skylineNav.trend = nextTrend
      skylineNav.weather = WEATHER_PRESETS[Math.floor(Math.random() * WEATHER_PRESETS.length)] ?? skylineNav.weather
      lastUpdated.value = formatClock()
      refreshTrendInsight()
      statusMessage.value = skylineNav.trendDelta >= 0
        ? '客流曲线向上，建议优先处理爆品订单。'
        : '客流短时回落，可以推送限时优惠提升转化。'
      runPulse()
      if (showToast) {
        wx.showToast({
          title: '趋势已刷新',
          icon: 'none',
        })
      }
    }

    function showPromotions() {
      wx.showActionSheet({
        itemList: ['满 69 减 10', '第二杯半价', '会员免配送费'],
      })
    }

    function toggleBusinessStatus() {
      skylineNav.status = skylineNav.status === '营业中' ? '高峰预警' : '营业中'
      statusMessage.value = skylineNav.status === '营业中'
        ? '门店状态已恢复，建议继续冲刺热销品。'
        : '高峰预警已开启，建议优先准备极速出餐。'
      wx.showToast({
        title: skylineNav.status,
        icon: 'none',
      })
    }

    function handleNavAction() {
      refreshTrend(false)
      wx.showToast({
        title: '已同步最新趋势',
        icon: 'none',
      })
    }

    function handleNavSecondaryAction(e: any) {
      const action = e?.detail as string
      if (action === 'search') {
        wx.showToast({
          title: '搜索能力开发中',
          icon: 'none',
        })
        return
      }
      if (action === 'notify') {
        wx.showToast({
          title: '你有 3 条门店提醒',
          icon: 'none',
        })
      }
    }

    refreshTrendInsight()

    return {
      skylineNav,
      trendInsight,
      statusMessage,
      lastUpdated,
      pulseBoost,
      goToCart,
      refreshTrend,
      showPromotions,
      toggleBusinessStatus,
      handleNavAction,
      handleNavSecondaryAction,
    }
  },
})
