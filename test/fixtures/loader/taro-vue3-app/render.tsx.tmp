import { createVNode as _createVNode, createTextVNode as _createTextVNode } from "vue";
import { defineComponent } from 'vue';
import { View, Button } from '@tarojs/components';
export default defineComponent({
  components: {
    View: View,
    Button: Button
  },
  render: function render() {
    return _createVNode(View, {
      "class": 'text-amber-300'
    }, {
      default: function _default() {
        return [_createVNode(View, {
          "class": 'text-center text-[50px] text-red-400 mt-[22px]'
        }, {
          default: function _default() {
            return [_createTextVNode("aaa")];
          }
        }), _createVNode(Button, {
          "type": 'primary',
          "block": true
        }, {
          default: function _default() {
            return [_createTextVNode("first")];
          }
        })];
      }
    });
  }
});