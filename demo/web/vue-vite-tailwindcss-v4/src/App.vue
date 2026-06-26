<script setup lang="ts">
const rows = [
  'bg-[#ffd230] text-[#18181b]',
  'bg-[#7bf1a8] text-[#18181b]',
  'bg-[#8ec5ff] text-[#18181b]',
  'bg-[#fda5d5] text-[#18181b]',
]
</script>

<template>
  <main class="box-border min-h-screen tw-root bg-[#fafafa] p-6 text-[#18181b] dark:bg-[#18181b] dark:text-[#fafafa]">
    <section class="box-border mx-auto grid max-w-4xl gap-6">
      <div class="box-border rounded border border-solid border-[rgba(24,24,27,0.1)] bg-white p-5 [box-shadow:0_8px_24px_rgba(0,0,0,0.12)] dark:bg-[#18181b]">
        <h1 class="m-0 text-[32px] leading-[38px] font-semibold">
          Vue Vite Tailwind CSS v4
        </h1>
        <p class="mt-3 text-sm leading-6 text-[#52525c] dark:text-[#d4d4d8]">
          Web target is the default. Use build:weapp to compare mini-program CSS output.
        </p>
        <div class="box-border theme-mode-demo mt-4 rounded leading-[24px] bg-white px-4 py-3 text-[#0f172b] system-dark:bg-[#0f172b] system-dark:text-[#f1f5f9] dark:bg-[#18181b] dark:text-[#fafafa]">
          Vue Vite Tailwind CSS v4 system dark
          <div class="box-border theme-dark mt-2 rounded leading-[24px] bg-white px-3 py-2 text-[#0f172b] dark:bg-[#09090b] dark:text-[#fafafa]">
            Vue Vite Tailwind CSS v4 manual dark
          </div>
        </div>
      </div>
      <div class="box-border grid grid-cols-2 gap-[16px] md:grid-cols-4">
        <div
          v-for="item in rows"
          :key="item"
          :class="`${item} box-border rounded p-[24px] text-center leading-[18px] before:mr-1 before:content-['v4']`"
        >
          swatch
        </div>
      </div>
      <div class="box-border -mt-1.5 grid grid-cols-2 gap-3.5 rounded-[18.5px] border border-dashed border-[rgba(51,102,153,0.4)] bg-[linear-gradient(135deg,#f8fafc_0%,#dbeafe_100%)] !p-[18.5px]">
        <div class="box-border -rotate-2 bg-[#123456] px-[13.5px] py-1.5 text-[13.5px] leading-[18px] text-white [box-shadow:0_2.5px_7.5px_rgba(18,52,86,0.35)]">
          arbitrary
        </div>
        <div class="box-border !mt-0 -ml-[5.5px] w-[37.5%] min-w-[88.5px] !-translate-y-[3.5px] scale-[1.03] bg-[rgb(255,210,55)] text-center leading-[28px] text-[#1f2937] opacity-[0.82]">
          decimal
        </div>
      </div>
      <button class="box-border m-0 w-fit appearance-none rounded border-0 border-none bg-[#2b7fff] px-4 py-2 text-[14px] leading-[15px] text-white transition hover:bg-[#8ec5ff] active:bg-[#7bf1a8]">
        compare
      </button>
    </section>
  </main>
</template>
