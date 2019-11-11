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
import VueI18n from 'vue-i18n'

import zh from './lang/zh-CN'
import en from './lang/en-US'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))


Vue.http = Vue.prototype.$http = axios
Vue.prototype.$db = db
Vue.prototype.$ygo = ygo
Vue.prototype.$moment = moment
Vue.config.productionTip = false

Vue.use(VueI18n)
Vue.use(iView)

const messages = {
  "zh": zh,
  "en": en,
}
console.log()
let lang = 'zh'
if (localStorage.getItem('lang_setting')) {
  lang = localStorage.getItem('lang_setting')
} else {
  if (navigator.language !== 'zh-CN') {
    lang = 'en'
  }
  localStorage.setItem('lang_setting', lang)
  localStorage.setItem('first', 'true')
}
const i18n = new VueI18n({
  locale: lang,
  messages
})
new Vue({
  components: {
    App
  },
  i18n,
  router,
  store,
  template: '<App/>'
}).$mount('#app')