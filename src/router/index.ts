import { createWebHashHistory, createRouter } from 'vue-router'


const routes = [
    { path: '/', component: ()=>import('../views/HomePage.vue') },
    { path:'/chat-ai',component:()=>import('../views/ChatAI.vue')},
    {
        path: '/courses',component: ()=>import('../views/CourseNav.vue'),
        children: [
            { path: '/courses/:courseName/:courseDir', component: ()=>import('../views/CourseDetail.vue') },
        ]
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router