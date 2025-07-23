import { createApp } from 'vue'
import App from './App.vue'
import 'qyani-components/dist/qyani-components.css'
import router from './router'
createApp(App)
    .use(router)
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