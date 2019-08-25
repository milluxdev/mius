import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const routes = [{
  path: '/',
  name: 'main',
  component: require('@/components/MainPage').default,
  children: [{
      path: '/222server',
      name: 'server',
      component: require('@/components/page/ServerPage').default,
    }, {
      path: '/',
      name: '7210server',
      component: require('@/components/page/Server7210Page').default,
    }, {
      path: '/1311server',
      name: '1311server',
      component: require('@/components/page/Server1311Page').default,
    }, {
      path: '/mcserver',
      name: 'mcserver',
      component: require('@/components/page/McServerPage').default,
    },
    {
      path: '/mclogin',
      name: 'mclogin',
      component: require('@/components/page/McloginPage').default,
    }, {
      path: '/deck',
      name: 'deck',
      component: require('@/components/page/DeckPage').default,
    }, {
      path: '/xpg',
      name: 'xpg',
      component: require('@/components/page/XpgPage').default,
    },
  ]
}]

const router = new Router({
  routes,
});


export default router;