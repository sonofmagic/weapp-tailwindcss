import { tw } from '@weapp-tailwindcss/react-native/runtime'
import { Text, useColorScheme, View } from 'react-native'

export default function App() {
  const colorScheme = useColorScheme() ?? 'light'
  const dynamicClassName = colorScheme === 'dark' ? 'text-white' : 'text-slate-900'
  return (
    <View className="flex items-center justify-center" style={{ flex: 1 }}>
      <View className="w-[180px] h-[48px] rounded-lg bg-blue-500 dark:bg-slate-900 ios:px-4 android:px-2">
        <Text className="text-white">{colorScheme === 'dark' ? 'Dark' : 'Light'}</Text>
      </View>
      <Text className={dynamicClassName} style={{ marginTop: 8 }}>Dynamic class</Text>
      <Text style={tw({ 'text-white': true })}>Tailwind RN</Text>
    </View>
  )
}
