// import {createApp} from 'vue'
import {
  createRouter,
  createWebHashHistory,
} from 'vue-router'

// createApp.use(VueRouter)

// const RouteView = {
//   name: 'RouteView',
//   render: h => h('router-view'),
// }

const routes = [
  // {
  //   path: '/',
  //   name: 'home',
  //   component: () => import('../views/login/layout'),
  //   meta: {
  //     title: '',
  //     needLogin: true,
  //   },
  //   children: [
  //     {
  //       path: '/',
  //       meta: {
  //         title: '账号登录？',
  //         needLogin: false,
  //       },
  //       component: () => import('../views/login/index'),
  //     }]
  // },
  {
    path: '/',
    name: 'home',
    component: () => import('../views/message/index'),
    meta: {
      title: '',
      noCache: false,
      transition: 'slide-left'
    },
    
  },
  {
    path: '/chat/:talk_type/:receiver_id/:nickname/:index',
    name: 'chat',
    component: () => import('../views/message/plane'),
    props: true ,
    meta: {
      title: '',
      noCache: true,
      transition: 'slide-right'
    },
    
  },
  // {
  //   path: '*',
  //   name: '404 NotFound',
  //   component: () => import('../views/other/404'),
  //   meta: {
  //     title: '404 NotFound',
  //     needLogin: false,
  //   },
  // },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
router.afterEach((to, from) => {
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  to.meta.transition = toDepth < fromDepth ? 'slide-right' : 'slide-left'
})
export default router