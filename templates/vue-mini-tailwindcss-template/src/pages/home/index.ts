import { defineComponent, ref } from '@vue-mini/core'
import Message from 'tdesign-miniprogram/message/index'

defineComponent(() => {
  const greeting = ref('欢迎使用 Vue Mini')
  const bg = ref('bg-gradient-to-r from-[#456789] to-[#987654] h-[123.456px] text-[#fafafa] flex items-center justify-center')

  function onClick() {
    Message.success({
      content: '点击了按钮',
    })
  }

  return {
    greeting,
    bg,
    onClick,
  }
})
