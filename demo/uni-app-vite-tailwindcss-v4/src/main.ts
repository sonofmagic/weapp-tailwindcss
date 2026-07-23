import { createSSRApp } from "vue";
import "./main.css";
import "./third-party-ui.css";
import "./issue-1005-theme.css";
import App from "./App.vue";
export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
