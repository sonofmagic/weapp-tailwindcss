import { defineComponent, ref } from '@vue-mini/core'

defineComponent(() => {
  const greeting = ref('希望你会喜欢')

  return {
    greeting,
  }
})
