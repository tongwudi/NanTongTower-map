<template>
  <div id="map">
    <LeftBottomOperation @changeForbidden="changeForbidden" />
    <RightBottomOperation />
  </div>
</template>

<script>
import { initMap, renderArea, changeForbidden } from '@/utils/map'

// import coordinateTransform from '../utils/CoordinateTransform.js'

import LeftBottomOperation from './components/LeftBottomOperation'
import RightBottomOperation from './components/RightBottomOperation'

export default {
  components: {
    LeftBottomOperation,
    RightBottomOperation
  },
  data() {
    return {
      map: null
      // forbiddenData: []
    }
  },
  provide() {
    return {
      getMap: () => this.map
    }
  },
  mounted() {
    // this.initMap()
    this.map = initMap('map')
    renderArea()
    // this.renderArea()
  },
  methods: {
    // initMap() {
    //   // 计算百度地图使用的分辨率
    //   const baiduResolutions = []
    //   for (let i = 0; i <= 18; i++) {
    //     baiduResolutions[i] = Math.pow(2, 18 - i)
    //   }
    //   // 自定义瓦片坐标系
    //   const tilegrid = new TileGrid({
    //     origin: [0, 0], // 设置原点坐标
    //     resolutions: baiduResolutions // 设置分辨率
    //   })
    //   // 创建百度地图的数据源
    //   const baiduSource = new TileImage({
    //     tileGrid: tilegrid,
    //     tileUrlFunction: (tileCoord, pixelRatio, proj) => {
    //       let [z, x, y] = tileCoord

    //       if (x < 0) {
    //         x = -x
    //       }
    //       if (y < 0) {
    //         y = -y - 1 // ol6版本需要此处减一，否则缩放有偏移
    //       }
    //       return 'tiles/' + z + '/' + x + '/' + y + '.png'
    //     }
    //   })

    //   // 初始化地图
    //   this.map = new Map({
    //     layers: [
    //       new TileLayer({
    //         source: baiduSource
    //       })
    //     ],
    //     view: new View({
    //       center: transform([120.8573, 31.8209], 'EPSG:4326', 'EPSG:3857'),
    //       extent: transformExtent(
    //         [
    //           118.69615846707765, 30.802104732318227, 122.80072753482629,
    //           32.76432917126385
    //         ],
    //         'EPSG:4326',
    //         'EPSG:3857'
    //       ),
    //       maxZoom: 14,
    //       zoom: 13 // 默认缩放级别
    //     }),
    //     target: 'map'
    //   })

    //   // this.map.on('pointerdrag', (e) => {
    //   //   const aa = this.map.getView().calculateExtent(this.map.getSize())
    //   //   // [13124506.972484231, 3560737.480626435, 13747717.963889513, 3864877.4279945334]
    //   //   // 13231349.26663091, 3607044.8908512387, 13688261.30705852, 3864057.9135917695
    //   //   // console.log(aa)
    //   //   // console.log(
    //   //   //   coordinateTransform.GCJ2BD(13688261.30705852, 3864057.9135917695)
    //   //   // )
    //   //   console.log(
    //   //     transform(
    //   //       [13688259.535219695, 3864064.2192280227],
    //   //       'EPSG:3857',
    //   //       'EPSG:4326'
    //   //     )
    //   //   )
    //   // })
    // },
    // renderArea() {
    //   areaData.forEach((item, i) => {
    //     // 渲染面
    //     let polygon = new Polygon([this.conversion(item.points)])
    //     let polygonFeature = new Feature({
    //       geometry: polygon
    //     })
    //     polygonFeature.setStyle(
    //       new Style({
    //         stroke: new Stroke({
    //           width: 2,
    //           lineDash: [10, 10, 10, 10], // 重点在这
    //           color: [255, 255, 0, 0.4]
    //         }),
    //         fill: new Fill({
    //           color: [248, 172, 166, 0.11]
    //         }),
    //         text: new Text({
    //           text: item.name,
    //           color: '#fff',
    //           font: 'normal 10px 微软雅黑',
    //           fill: new Fill({
    //             color: '#ccc'
    //           })
    //         })
    //       })
    //     )
    //     let vectorSource = new SourceVector()
    //     vectorSource.addFeature(polygonFeature)

    //     this.forbiddenData[i] = new LayerVector({
    //       source: vectorSource,
    //       zIndex: 1
    //     })
    //     this.map.addLayer(this.forbiddenData[i])
    //   })
    // },
    // conversion(position) {
    //   let cc = []
    //   position.forEach((item) => {
    //     cc.push(fromLonLat([Number(item[0]) + 0.013, Number(item[1]) - 0.17]))
    //   })
    //   return cc
    // },
    changeForbidden(isHide) {
      changeForbidden(isHide)
      // this.forbiddenData.forEach((item) => {
      //   if (isHide) {
      //     this.map.removeLayer(item)
      //   } else {
      //     this.map.addLayer(item)
      //   }
      // })
    }
  }
}
</script>

<style scoped>
#map {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
