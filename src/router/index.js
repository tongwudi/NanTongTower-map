import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import MapView from '@/views/MapView/index'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'map',
    component: MapView
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach(async (from, to, next) => {
  if (store.getters.hasToken) {
    next()
  } else {
    await store.dispatch('GET_TOKEN')
    next()
  }
})

export default router
