import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../views/Home.vue'

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
    if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
    return originalPush.call(this, location).catch(err => err)
}
Vue.use(VueRouter)

const routes = [{
        path: '/login',
        name: 'Login',
        component: () =>
            import ('../views/Login.vue')
    },
    {
        path: '/',
        name: 'Home',
        component: Home,
        redirect: '/index',
        children: [{
            path: '/index',
            name: 'index',
            component: () =>
                import ('../views/home/Index.vue')
        }, {
            path: '/account-information',
            name: 'AccountInformation',
            component: () =>
                import ('../views/home/AccountInformation.vue')
        }, {
            path: '/user-list',
            name: 'UserList',
            component: () =>
                import ('../views/home/UserList.vue')
        }, {
            path: '/regional-agents',
            name: 'RegionalAgents',
            component: () =>
                import ('../views/home/RegionalAgents.vue')
        }, {
            path: '/device-list',
            name: 'DeviceList',
            component: () =>
                import ('../views/home/DeviceList.vue')
        }]
    },
    {
        path: '/deviceDataList',
        name: 'deviceDataList',
        component: () =>
            import ('../views/deviceDataList.vue')
    }
]

const router = new VueRouter({
    routes
})

router.beforeEach((to, from, next) => {
    if (to.path !== '/login' && !window.sessionStorage.getItem('token') && to.path !== '/deviceDataList') next('/login')
    else next()
})

export default router