import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import directives from './directives'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

import 'ol/ol.css'
import './assets/style/index.scss'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
