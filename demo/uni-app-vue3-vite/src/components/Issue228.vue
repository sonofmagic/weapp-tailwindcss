<template>
  <image :mode="mode" :src="src" :style="styles" @load="onLoad" />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
// :class="class" 
const props = withDefaults(defineProps<{
  mode?: string;
  src: string;
  style?: object;
  // class?: string
}>(),{
  mode:'widthFix'
}) ;

const rect = reactive({
  width: 0,
  height: 0,
});
const styles = computed(() => ({
  width: rect.width + 'rpx',
  height: rect.height + 'rpx',
  ...props.style,
}));

function onLoad(event: { detail: { width: number, height: number } }) {
  const { detail } = event // as { detail: { width: number, height: number } };
  rect.width = detail.width;
  rect.height = detail.height;
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'NImage',
  mixins: [
    {
      options: {
        virtualHost: true,
      }
    }
  ]
})
</script>