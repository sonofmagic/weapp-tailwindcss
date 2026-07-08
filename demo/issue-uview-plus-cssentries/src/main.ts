import { createSSRApp } from "vue";
import uviewPlus from "uview-plus";
import { uviewConfig } from "./config/uviewConfig";
import App from "./App.vue";

import "./styles/tailwindcss.css";
import "./styles/uview.scss";

export function createApp() {
  const app = createSSRApp(App);
  app.use(uviewPlus, () => ({
    options: uviewConfig,
  }));
  return {
    app,
  };
}
