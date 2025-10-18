<template>
    <button class="reset-button" :class="className">
        <slot></slot>
    </button>
</template>

<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { twMerge } from '@weapp-tailwindcss/merge'
const button = twMerge(["font-semibold", "border", "rounded", "bg-blue-500", "text-white", "border-transparent", "text-base", "py-2", "px-4"]);

const props = defineProps<{
    customClass?: HTMLAttributes['class']
}>()

const className = computed(() => {
    return twMerge(button, props.customClass)
})

</script>

