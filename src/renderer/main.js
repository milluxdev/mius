import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import iView from 'iview'
import 'iview/dist/styles/iview.css'

import db from './datastore'
import ygo from './ygopro'
import moment from 'moment'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))


Vue.http = Vue.prototype.$http = axios
Vue.prototype.$db = db
Vue.prototype.$ygo = ygo
Vue.prototype.$moment = moment
Vue.config.productionTip = false

Vue.use(iView)
new Vue({
  components: {
    App
  },
  router,
  store,
  template: '<App/>'
}).$mount('#app')