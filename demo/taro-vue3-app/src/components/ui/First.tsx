import { defineComponent } from 'vue'
import { View, Button } from '@tarojs/components'
export default defineComponent({
  components: {
    View,
    Button
  },
  setup(props, ctx) {
    return () => {
      return (
        <View class={'text-amber-300'}>
          <View class={'text-center text-[50px] text-[#123456] mt-[22px]'} hover-class="bg-[#654321]">
            components ui
          </View>
        </View>
      )
    }
  }
})
