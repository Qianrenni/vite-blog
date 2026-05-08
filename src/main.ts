import { createApp } from "vue";
import App from "./App.vue";
import "qyani-components/dist/style.css";
import "./private.css";
import router from "./router";
import { createPinia } from "pinia";
createApp(App).use(router).use(createPinia()).mount("#app");
