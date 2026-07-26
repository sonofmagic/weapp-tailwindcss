import { tw } from '@weapp-tailwindcss/react-native/runtime'
import { Text, useColorScheme, View } from 'react-native'

export default function App() {
  const colorScheme = useColorScheme() ?? 'light'
  return (
    <View className="flex items-center justify-center" style={{ flex: 1 }}>
      <View className="w-[180px] h-[48px] rounded-lg bg-blue-500 dark:bg-slate-900 ios:px-4 android:px-2">
        <Text className="text-white">{colorScheme === 'dark' ? 'Dark' : 'Light'}</Text>
      </View>
      <Text style={tw({ 'text-white': true })}>Tailwind RN</Text>
    </View>
  )
}
