import { createWebHashHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/views/Home.vue"),
    children: [
      {
        path: "course",
        component: () => import("@/views/CourseDetail.vue"),
      },
    ],
  },
  {
    path: "/article",
    component: () => import("@/views/ArticlePage.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
