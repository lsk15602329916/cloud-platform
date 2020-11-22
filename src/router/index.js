import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../views/Home.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    redirect: '/index',
    children: [{
      path: '/index',
      name: 'index',
      component: () => import('../views/home/Index.vue')
    },{
      path: '/account-information',
      name: 'AccountInformation',
      component: () => import('../views/home/AccountInformation.vue')
    },{
      path: '/user-list',
      name: 'UserList',
      component: () => import('../views/home/UserList.vue')
    },{
      path: '/regional-agents',
      name: 'RegionalAgents',
      component: () => import('../views/home/RegionalAgents.vue')
    },{
      path: '/device-query',
      name: 'DeviceQuery',
      component: () => import('../views/home/DeviceQuery.vue')
    }]
  },
]

const router = new VueRouter({
  routes
})

router.beforeEach((to,from,next) => {
  if (to.path !== '/login' && !window.sessionStorage.getItem('token')) next('/login')
  else next()
})

export default router
