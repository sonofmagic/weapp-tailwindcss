// @ts-ignore
import uView from 'vk-uview-ui';
// import 'uno.css';
// import 'virtual:windi.css';
import { createSSRApp } from 'vue';
import App from './App.vue';
import bus from './bus';
export function createApp() {
  const app = createSSRApp(App);
  app.use(uView);
  app.mixin({
    created() {
      if (this.$scope) {
        // console.log(this.$scope)
        const originalOnLoad = this.$scope.onLoad;
        this.$scope.onLoad = async (params: Record<string, any>) => {
          await bus.promise;
          originalOnLoad.call(this, params);
        };
      }
    },
  });
  return {
    app,
  };
}
