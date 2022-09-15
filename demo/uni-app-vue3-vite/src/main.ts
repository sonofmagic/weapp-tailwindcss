import { createSSRApp } from 'vue'
import App from './App.vue'
import bus from './bus'
export function createApp () {
  const app = createSSRApp(App)
  app.mixin({
    created () {
      if (this.$scope) {
        // console.log(this.$scope)
        const orginalOnLoad = this.$scope.onLoad
        this.$scope.onLoad = async (params:Record<string, any>) => {
          await bus.promise
          orginalOnLoad.call(this, params)
        }
      }
    }
  })
  return {
    app
  }
}
