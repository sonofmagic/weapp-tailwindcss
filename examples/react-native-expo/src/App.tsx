/* eslint-disable node/prefer-global/process */

import { tw } from '@weapp-tailwindcss/react-native/runtime'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, PixelRatio, Platform, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native'
import evidence from './compatibility/static-evidence.json'
import { HMR_MARKER, HMR_MARKER_CLASS } from './hmr-marker'
import '@weapp-tailwindcss/react-native/env'

interface LayoutValue { width: number, height: number, x: number, y: number }

export default function App() {
  const colorScheme = useColorScheme() ?? 'light'
  const [layoutCount, setLayoutCount] = useState(0)
  const layouts = useRef(new Map<string, LayoutValue>())
  const sentRevision = useRef('')
  const cssHmrStyle = StyleSheet.flatten(tw('rn-css-hmr-probe')) as { backgroundColor?: string }
  const cssHmrColor = cssHmrStyle.backgroundColor ?? 'missing'
  const supportedRuntimeCases = useMemo(() => evidence.cases.filter((item) => {
    const result = evidence.report.results.find(entry => entry.id === item.id)
    return result?.status === 'supported' && item.evidence === 'runtime'
  }), [])

  useEffect(() => {
    const reportUrl = process.env.EXPO_PUBLIC_RN_REPORT_URL
    const revision = `${HMR_MARKER}:${cssHmrColor}`
    if (!reportUrl || layoutCount < supportedRuntimeCases.length || sentRevision.current === revision) {
      return
    }
    sentRevision.current = revision
    const window = Dimensions.get('window')
    const results = evidence.cases.map((item) => {
      const staticResult = evidence.report.results.find(result => result.id === item.id)!
      if (staticResult.status === 'unsupported' || item.evidence === 'build') {
        return staticResult
      }
      const layout = layouts.current.get(item.id)
      return {
        id: item.id,
        status: layout && layout.width > 0 && layout.height > 0 ? 'supported' : 'unsupported',
        reason: layout ? undefined : 'React Native onLayout did not report a measurable probe',
        checkpoints: [{
          name: `${item.probe}:probe`,
          passed: Boolean(layout && layout.width > 0 && layout.height > 0),
          actual: layout ? `${layout.x},${layout.y},${layout.width},${layout.height}` : 'missing',
          expected: 'measurable React Native layout',
        }],
      }
    })
    void fetch(reportUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        hmrMarker: HMR_MARKER,
        cssHmrColor,
        report: {
          ...evidence.report,
          platform: Platform.OS,
          verifiedAt: new Date().toISOString(),
          environment: {
            deviceName: `${Platform.OS}-runtime`,
            osName: Platform.OS,
            osVersion: String(Platform.Version),
            runtimeIdentifier: `expo-${Platform.OS}`,
            abi: Platform.OS === 'web' ? 'n/a' : 'simulator',
            viewport: { width: window.width, height: window.height, pixelRatio: PixelRatio.get() },
          },
          results,
        },
      }),
    })
  }, [cssHmrColor, layoutCount, supportedRuntimeCases, HMR_MARKER])

  const recordLayout = (id: string, layout: LayoutValue) => {
    if (!layouts.current.has(id)) {
      layouts.current.set(id, layout)
      setLayoutCount(layouts.current.size)
    }
  }

  return (
    <ScrollView testID="tw-rn-root" accessibilityLabel="tw-rn-root" className="flex" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-2xl font-bold text-slate-900">React Native Tailwind compatibility</Text>
      <View testID="tw-rn-card" accessibilityLabel="tw-rn-card" className="w-[180px] h-[48px] rounded-lg bg-blue-500 dark:bg-slate-900 ios:px-4 android:px-2">
        <Text testID="tw-rn-theme" accessibilityLabel="tw-rn-theme" className="text-white">{colorScheme === 'dark' ? 'Dark' : 'Light'}</Text>
      </View>
      <View testID="tw-rn-hmr" accessibilityLabel={HMR_MARKER} style={tw(`w-[180px] h-[24px] ${HMR_MARKER_CLASS}`)}>
        <Text className="text-white">{HMR_MARKER}</Text>
      </View>
      <View testID="tw-rn-css-hmr" accessibilityLabel={`css-hmr-${cssHmrColor}`} className="rn-css-hmr-probe w-[180px] h-[24px]">
        <Text className="text-white">css-hmr</Text>
      </View>
      {supportedRuntimeCases.map(item => (
        <View key={item.id} testID={`probe-${item.id}`} accessibilityLabel={`probe-${item.id}`} style={[{ minHeight: 2, minWidth: 2 }, tw(item.className)]} onLayout={event => recordLayout(item.id, event.nativeEvent.layout)}>
          <Text>{item.id}</Text>
        </View>
      ))}
      <Text>Tailwind RN</Text>
    </ScrollView>
  )
}
