import { createSSRApp } from "vue";
import "./main.css";
import "./third-party-ui.css";
import App from "./App.vue";
export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
