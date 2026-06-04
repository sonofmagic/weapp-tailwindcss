// @ts-ignore
// import uView from 'vk-uview-ui';
// import 'uno.css';
// import 'virtual:windi.css';
if (import.meta.env.VITE_WEAPP_TW_WATCH_REGRESSION === '1') {
  import('./tailwind.scss');
}
import uviewPlus from 'uview-plus';
import { createSSRApp } from 'vue';
import App from './App.vue';
import bus from './bus';
export function createApp() {
  const app = createSSRApp(App);
  app.use(uviewPlus);
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
