<template>
  <main class="min-h-screen bg-white p-6 text-[#111827]">
    <h1 class="hmr-title m-0 text-xs">
      Vue Vite 7 Tailwind CSS v4 HMR
    </h1>
    <div class="theme-mode-demo mt-4 bg-white text-[#0f172b] system-dark:bg-[#0f172b] system-dark:text-[#f1f5f9] dark:bg-[#09090b] dark:text-[#fafafa]">
      {{ themeModeLabel }}
      <div class="theme-dark mt-2 bg-white px-3 py-2 text-[#0f172b] dark:bg-[#09090b] dark:text-[#fafafa]">
        Vue Vite 7 Tailwind CSS v4 manual dark
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const themeModeLabel = 'theme-dark'
</script>

<style scoped>
.hmr-title {
  font-weight: 600;
}
</style>
