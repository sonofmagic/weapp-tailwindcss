<template>
  <view class="space-y-2 text-sm">
    <text
      v-for="(value, key) in headers"
      :key="key"
      class="block font-semibold text-slate-700"
      :data-header="key"
    >{{ value }}</text>
  </view>
</template>

<script setup lang="ts">
const headers = {
  Accept: 'text/event-stream',
  'X-Client-Accept': 'text/plain',
  'X-Debug-Format': 'text/html',
  'X-Fallback-Format': 'text/css',
  'X-Notification-Format': 'text/calendar',
  'X-Trace-Format': `text/csv`,
}

console.log(headers)
</script>
