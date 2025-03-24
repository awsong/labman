import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import App from "./App.vue";
import router from "./router";
import "./assets/css/index.css";
import "./assets/css/theme.css";
import api from "./utils/api";

const app = createApp(App);

// Create global properties for API
app.config.globalProperties.$api = api;

// Register Element Plus
app.use(ElementPlus);

// Register all icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(createPinia());
app.use(router);
app.mount("#app");
