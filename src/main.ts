import { createApp } from 'vue'
import App from './App.vue'
import 'qyani-components/dist/style.css'
import '../public/assets/css/private.css'
import qcomponents from 'qyani-components'
import router from './router'
import {createPinia} from 'pinia'
createApp(App)
    .use(router)
    .use(createPinia())
    .use(qcomponents)
    .mount('#app')