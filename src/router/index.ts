import { createWebHashHistory, createRouter } from 'vue-router'


const routes = [
    { path: '/', component: ()=>import('../views/HomePage.vue') },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router