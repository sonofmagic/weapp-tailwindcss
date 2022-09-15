import Vue from 'vue'
import App from './App.vue'
import bus from './bus'
// @ts-ignore
import uView from 'uview-ui'
Vue.use(uView)
Vue.config.productionTip = false
Vue.mixin({
  created () {
    // @ts-ignore
    if (Array.isArray(this.$options.onLoad) && this.$options.onLoad.length) {
      // @ts-ignore
      this.$options.onLoad = this.$options.onLoad.map(x => {
        return async (params:Record<string, any>) => {
          await bus.promise
          x.call(this, params)
        }
      })
    }
  }
})
new App().$mount()
