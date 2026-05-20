<script setup lang="ts">
const rows = [
  'bg-amber-300 text-zinc-900',
  'bg-green-300 text-zinc-900',
  'bg-blue-300 text-zinc-900',
  'bg-pink-300 text-zinc-900',
]
</script>

<template>
  <main class="min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50">
    <section class="mx-auto grid max-w-4xl gap-6">
      <div class="rounded border border-zinc-900/10 bg-white p-5 shadow-[0_8rpx_24rpx_rgba(0,0,0,0.12)] dark:bg-zinc-900">
        <h1 class="text-[32rpx] font-semibold">
          Vue Vite Tailwind CSS v3
        </h1>
        <p class="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          Web target is the default. Use build:weapp to compare mini-program CSS output.
        </p>
      </div>
      <div class="grid grid-cols-2 gap-[16rpx] md:grid-cols-4">
        <div
          v-for="item in rows"
          :key="item"
          :class="`${item} rounded p-[24rpx] text-center before:mr-1 before:content-['v3']`"
        >
          swatch
        </div>
      </div>
      <button class="w-fit rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-300 active:bg-green-300">
        compare
      </button>
    </section>
  </main>
</template>
