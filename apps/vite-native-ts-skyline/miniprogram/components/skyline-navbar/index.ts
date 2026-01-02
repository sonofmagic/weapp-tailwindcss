import { defineComponent, onMounted, onUnmounted, ref, watch } from 'wevu'

type TrendPoint = number

const defaultTrend: TrendPoint[] = [42, 68, 54, 92, 78, 118, 88]

function formatTime() {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export default defineComponent({
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
  setup(props, ctx) {
    const currentTime = ref(formatTime())
    const trendBars = ref<Array<{ height: number, label: string }>>([])

    let timer: number | undefined

    function updateTime() {
      currentTime.value = formatTime()
    }

    function updateTrend(trend: TrendPoint[]) {
      if (!Array.isArray(trend) || trend.length === 0) {
        trendBars.value = []
        return
      }

      const max = Math.max(...trend)
      const min = Math.min(...trend)
      const range = Math.max(max - min, 1)

      trendBars.value = trend.map((value, index) => {
        const height = Math.round(((value - min) / range) * 55 + 45)
        return {
          height,
          label: `T${index + 1}`,
        }
      })
    }

    watch(
      () => props.trend as TrendPoint[],
      (value) => updateTrend(value),
      { immediate: true, deep: true },
    )

    onMounted(() => {
      updateTime()
      timer = setInterval(updateTime, 60000)
    })

    onUnmounted(() => {
      if (timer != null) clearInterval(timer)
      timer = undefined
    })

    function handlePrimaryTap() {
      ctx.emit('primarytap')
    }

    return {
      currentTime,
      trendBars,
      handlePrimaryTap,
    }
  },
})
