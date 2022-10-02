import Vue from 'vue'
import { View, Button } from '@tarojs/components'
export default Vue.extend({
  components: {
    View,
    Button
  },
  render() {
    return (
      <View class={'text-amber-300'}>
        <View class={'text-center text-[50px] text-[#123456] mt-[22px]'} hover-class="bg-[#654321]">
          aaa
        </View>
        <Button type={'primary'} block>
          first
        </Button>
      </View>
    )
  }
})
