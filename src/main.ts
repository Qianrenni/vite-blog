import { createApp } from "vue";
import App from "./App.vue";
import "qyani-components/dist/style.css";
import "./private.css";
import router from "./router";
createApp(App).use(router).mount("#app");
