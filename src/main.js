import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/css/index.css";
import "./assets/css/theme.css";
import api from "./utils/api";

const app = createApp(App);

// Create global properties for API
app.config.globalProperties.$api = api;

app.use(createPinia());
app.use(router);

app.mount("#app");
