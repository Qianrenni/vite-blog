import { createApp } from 'vue'
import App from './App.vue'
import 'qyani-components/dist/qyani-components.css'
import '../public/assets/css/private.css'
import router from './router'
import {createPinia} from 'pinia'
createApp(App)
    .use(router)
    .use(createPinia())
    .mount('#app')

function setThemeFromSystemPreference() {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
        console.log('Dark mode enabled')
        document.body.classList.add('dark-mode');
    }
}

setThemeFromSystemPreference();

// 监听系统主题变化（可选）
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (e.matches) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
});