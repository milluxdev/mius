import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const routes = [{
  path: '/load',
  name: 'load',
  component: require('@/components/page/LoadPage').default,
}, {
  path: '/',
  name: 'main',
  component: require('@/components/MainPage').default,
  children: [{
      path: '/',
      name: '7210server',
      component: require('@/components/page/Server7210Page').default,
    }, {
      path: '/222server',
      name: 'server',
      component: require('@/components/page/ServerPage').default,
    }, {
      path: '/1311server',
      name: '1311server',
      component: require('@/components/page/Server1311Page').default,
    }, {
      path: '/mcserver',
      name: 'mcserver',
      component: require('@/components/page/McServerPage').default,
    }, {
      path: '/YGOCC',
      name: 'YGOCC',
      component: require('@/components/page/ServerYgoccPage').default,
    }, {
      path: '/NO81',
      name: 'NO81',
      component: require('@/components/page/ServerNO81Page').default,
    },
    {
      path: '/mclogin',
      name: 'mclogin',
      component: require('@/components/page/McloginPage').default,
    }, {
      path: '/deck',
      name: 'deck',
      component: require('@/components/page/DeckPage').default,
    }
  ]
}]

const router = new Router({
  routes,
});


export default router;