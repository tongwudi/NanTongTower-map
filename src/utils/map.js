import { Map, View, Feature } from 'ol'
import TileGrid from 'ol/tilegrid/TileGrid'
import { transform, transformExtent, fromLonLat } from 'ol/proj'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { TileImage, Vector as VectorSource } from 'ol/source'
import { Draw } from 'ol/interaction'
import { Polygon } from 'ol/geom'
import { Style, Stroke, Fill, Text } from 'ol/style'

import areaData from './areaData'

/**
 * 地图初始化
 * @constant map 地图对象
 * @param {String} target 元素id
 */
let map = null
export const initMap = (target) => {
  // 计算百度地图使用的分辨率
  const baiduResolutions = []
  for (let i = 0; i <= 18; i++) {
    baiduResolutions[i] = Math.pow(2, 18 - i)
  }
  // 自定义瓦片坐标系
  const tilegrid = new TileGrid({
    origin: [0, 0], // 设置原点坐标
    resolutions: baiduResolutions // 设置分辨率
  })
  // 创建百度地图的数据源
  const baiduSource = new TileImage({
    tileGrid: tilegrid,
    tileUrlFunction: (tileCoord, pixelRatio, proj) => {
      let [z, x, y] = tileCoord

      if (x < 0) {
        x = -x
      }
      if (y < 0) {
        y = -y - 1 // ol6版本需要此处减一，否则缩放有偏移
      }
      return 'tiles/' + z + '/' + x + '/' + y + '.png'
    }
  })
  // 初始化地图
  map = new Map({
    layers: [
      new TileLayer({
        source: baiduSource
      })
    ],
    view: new View({
      center: transform([120.8573, 31.8209], 'EPSG:4326', 'EPSG:3857'),
      extent: transformExtent(
        [
          118.69615846707765, 30.802104732318227, 122.80072753482629,
          32.76432917126385
        ],
        'EPSG:4326',
        'EPSG:3857'
      ),
      maxZoom: 14,
      zoom: 13 // 默认缩放级别
    }),
    target
  })
  return map
}

/**
 * 渲染禁区图形
 * @constant forbiddenLayer 禁区图层
 */
let forbiddenLayer = null
export const renderArea = () => {
  // const vectorSource = new VectorSource()
  forbiddenLayer = new VectorLayer({
    // zIndex: 1,
    // source: vectorSource // ① 第一种方式
    source: new VectorSource() // ② 第二种方式
  })
  areaData.forEach((item) => {
    const polygonFeature = new Feature({
      geometry: new Polygon([conversion(item.points)])
    })
    polygonFeature.setStyle(
      new Style({
        stroke: new Stroke({
          width: 2,
          lineDash: [10, 10, 10, 10],
          color: [255, 255, 0, 0.5]
        }),
        fill: new Fill({
          color: [50, 50, 50, 0.5]
        }),
        text: new Text({
          text: item.name,
          font: 'normal 12px 微软雅黑',
          fill: new Fill({
            color: '#ccc'
          })
        })
      })
    )
    // vectorSource.addFeature(polygonFeature)
    forbiddenLayer.getSource().addFeature(polygonFeature)
  })
  map.addLayer(forbiddenLayer)
}

/**
 * 切换禁区渲染与销毁
 * @param {Boolean} isHide 是否显示
 */
export const changeForbidden = (isHide) => {
  isHide ? map.removeLayer(forbiddenLayer) : map.addLayer(forbiddenLayer)
}

/**
 * 绘制图层初始化
 * @constant drawLayer 绘制图层
 */
let drawLayer = null
export const initDraw = () => {
  // 初始化绘制图层
  drawLayer = new VectorLayer({
    source: new VectorSource(),
    // 图形绘制完成样式
    style: new Style({
      // 笔触样式
      stroke: new Stroke({
        color: 'green',
        width: 2
      }),
      // 填充样式
      fill: new Fill({
        color: 'crimson'
      })
    })
  })
  map.addLayer(drawLayer)
}
/**
 * 绘制图形
 * @constant interaction 绘制工具
 * @constant featureTemp 当前绘制对象
 * @param {String} type 图形类型
 * @method drawstart 绘制前事件
 * @method drawend 绘制完成事件
 */
let interaction = null,
  featureTemp = null
export const drawGraph = (type, callback) => {
  // 初始化绘制工具
  interaction = new Draw({
    // 多边形环或线串完成之前可以绘制的点数。默认情况下没有限制。
    // maxPoints: 5,
    source: drawLayer.getSource(),
    type,
    // 图形绘制时样式
    style: new Style({
      stroke: new Stroke({
        width: 2,
        color: 'skyblue'
      }),
      fill: new Fill({
        color: [248, 172, 166, 0.11]
      })
    })
  })
  map.addInteraction(interaction)

  // 绘制前清除上一次绘制
  let areaScope = [],
    radius = ''
  interaction.on('drawstart', (e) => {
    if (featureTemp) {
      drawLayer.getSource().removeFeature(featureTemp)
    }
  })
  // 绘制完成返回绘制数据
  interaction.on('drawend', (e) => {
    featureTemp = e.feature

    if (type === 'Polygon') {
      // 获取转折点坐标集合
      const arr = e.feature
        .clone()
        .getGeometry()
        .transform('EPSG:3857', 'EPSG:4326')
        .getCoordinates()[0]

      areaScope = arr
      radius = ''
    } else {
      // 获取圆心坐标
      const arr = e.feature
        .clone()
        .getGeometry()
        .transform('EPSG:3857', 'EPSG:4326')
        .getCenter()

      areaScope = [arr]
      // 获取半径，只有圆才有值
      radius = e.feature.getGeometry().getRadius()
    }
    callback({ areaScope, radius })
  })
}

/**
 * 清除交互对象
 */
export const removeInteraction = () => {
  drawLayer.getSource().removeFeature(featureTemp)

  if (interaction != undefined && interaction != null) {
    map.removeInteraction(interaction)
  }
}

/**
 * 偏移值转换
 * @param {Array} position 点位信息
 * @returns
 */
const conversion = (position) => {
  let cc = []
  position.forEach((item) => {
    cc.push(fromLonLat([Number(item[0]) + 0.013, Number(item[1]) - 0.17]))
  })
  return cc
}
