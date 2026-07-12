<template>
  <div class="nav-logo px-1 text-xs">
    Nuxt Vite Tailwind CSS v4 HMR
    <span class="ml-10 block text-[var(--gold-strong)]">MAOXING TECH.</span>
    <span class="theme-mode-demo mt-4 block bg-white text-[#0f172b] system-dark:bg-[#0f172b] system-dark:text-[#f1f5f9] dark:bg-[#09090b] dark:text-[#fafafa]">
      {{ themeModeLabel }}
      <span class="theme-dark mt-2 block bg-white px-3 py-2 text-[#0f172b] dark:bg-[#09090b] dark:text-[#fafafa]">
        Nuxt Vite Tailwind CSS v4 manual dark
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
const themeModeLabel = 'theme-dark'
</script>

<style scoped>
.nav-logo {
  font-weight: 600;
}
</style>
