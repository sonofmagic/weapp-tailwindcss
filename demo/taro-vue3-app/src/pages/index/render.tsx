import { defineComponent } from 'vue'
import { View, Button } from '@tarojs/components'
export default defineComponent({
  components: {
    View,
    Button
  },
  render() {
    return (
      <View class={'text-amber-300'}>
        <View class={'text-center text-[50px] text-red-400 mt-[22px]'}>aaa</View>
        <Button type={'primary'} block>
          first
        </Button>
      </View>
    )
  }
})
