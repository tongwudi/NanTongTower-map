import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import MapView from '@/views/MapView/index'
import PositionView from '@/views/PositionView/index'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'MapView',
    component: MapView
  },
  {
    path: '/position-map',
    name: 'PositionView',
    component: PositionView
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.name === '/') {
    if (store.getters.hasToken) {
      next()
    } else {
      await store.dispatch('GET_TOKEN')
      next()
    }
  } else{
    next()
  }
})

export default router
