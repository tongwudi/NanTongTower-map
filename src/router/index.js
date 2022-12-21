import Vue from 'vue'
import VueRouter from 'vue-router'
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

export default router
