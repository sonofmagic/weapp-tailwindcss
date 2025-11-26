import { Text, View } from '@tarojs/components'

type Tone = 'primary' | 'neutral' | 'danger'

interface TagProps {
  tone?: Tone
  text?: string
}

export default function Tag({ tone = 'primary', text = '标签' }: TagProps) {
  const styles: Record<Tone, string> = {
    primary: 'bg-sky-500 text-slate-50',
    neutral: 'bg-slate-100 text-slate-900',
    danger: 'bg-red-50 text-red-800',
  }
  const toneClass = styles[tone]
  return (
    <View className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold ${toneClass}`}>
      <Text>{text}</Text>
    </View>
  )
}
