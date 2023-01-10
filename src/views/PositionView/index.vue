<template>
  <div id="map"></div>
</template>

<script>
import { initMap, renderPosition } from '@/utils/map'

export default {
  data() {
    return {
      map: null
    }
  },
  mounted() {
    this.map = initMap('map')

    // 地址示例：http://localhost:8080/#/position-map/?lon=120.8573&lat=31.8209
    const params = this.$route.query
    if (params.lon && params.lat) {
      const point = [params.lon, params.lat]
      renderPosition(point)
    }
  }
}
</script>

<style lang="scss" scoped>
#map {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
