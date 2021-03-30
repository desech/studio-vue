import { createRouter, createWebHistory } from 'vue-router'
import Index from '../page/Index.vue'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index
  }
  // desech studio - start route block
  // desech studio - end route block
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
