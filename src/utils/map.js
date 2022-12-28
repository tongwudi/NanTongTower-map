import { Map, View, Feature } from 'ol'
import TileGrid from 'ol/tilegrid/TileGrid'
import { transform, transformExtent, fromLonLat } from 'ol/proj'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { TileImage, Vector as VectorSource } from 'ol/source'
import { Draw } from 'ol/interaction'
import { Polygon, Circle, Point } from 'ol/geom'
import { Style, Stroke, Fill, Text, Icon } from 'ol/style'

import areaData from './areaData'

/**
 * 初始化地图
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
export const renderForbidden = () => {
  const vectorSource = new VectorSource({ wrapX: false })
  forbiddenLayer = new VectorLayer({
    source: vectorSource // ① 第一种方式
    // source: new VectorSource() // ② 第二种方式
  })
  map.addLayer(forbiddenLayer)

  let features = []
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
    features.push(polygonFeature) // ① 第一种方式
    // forbiddenLayer.getSource().addFeature(polygonFeature) // ② 第二种方式
  })
  vectorSource.addFeatures(features)
}

/**
 * 禁区图层渲染与销毁
 * @param {Boolean} isHide 是否显示
 */
export const destroyForbiddenLayer = (isHide) => {
  isHide ? map.removeLayer(forbiddenLayer) : map.addLayer(forbiddenLayer)
}

/**
 * 渲染标记点图层
 * @constant markerLayer 标记点图层
 * @param {[]} markers 标记点信息集合
 * @param {[]} areas 覆盖区域信息集合
 */
let markerLayer = null
export const renderMarkerFeature = (markers, areas) => {
  markerLayer && map.removeLayer(markerLayer)

  const vectorSource = new VectorSource({ wrapX: false })
  markerLayer = new VectorLayer({
    source: vectorSource
  })
  map.addLayer(markerLayer)

  let markersFeatures = []
  markers.forEach((item) => {
    let feature = new Feature({
      geometry: new Point(
        fromLonLat([Number(item.lon) + 0.013, Number(item.lat) - 0.167])
      ),
      marker: item
    })
    feature.setStyle(
      new Style({
        zIndex: 1,
        image: new Icon({
          scale: 0.32,
          src: chooseMarkerIcon(item)
        }),
        // text 文本标签样式
        text: new Text({
          backgroundStroke: new Stroke({
            color: 'rgba(0,0,0,0.5)',
            width: 8
          }),
          backgroundFill: new Fill({
            color: 'rgba(0,0,0,0.5)'
          }),
          font: 'normal 14px 微软雅黑',
          offsetX: 17,
          offsetY: -6,
          textAlign: 'left',
          text: item.name,
          fill: new Fill({
            color: '#ccc'
          })
        })
      })
    )
    markersFeatures.push(feature)
  })
  let areasFeatures = []
  areas.forEach((item) => {
    let feature = new Feature({
      geometry: new Point(
        fromLonLat([Number(item.lon) + 0.013, Number(item.lat) - 0.167])
      )
    })
    feature.setStyle(
      new Style({
        image: new Icon({
          scale: 0.4,
          src:
            item.type === 1
              ? require('@/assets/image/marker_icon/2_back.png')
              : require('@/assets/image/marker_icon/3_back.png'),
          offset: [0, -30]
        })
      })
    )
    areasFeatures.push(feature)
  })
  vectorSource.addFeatures([...areasFeatures, ...markersFeatures])
}

/**
 * 渲染绘制图层
 * @constant drawLayer 绘制图层
 * @constant drawFeatures 本地图形要素信息，定位时需要
 * @param {[]} arr 图形要素信息集合
 */
let drawLayer = null
let drawFeatures = []
export const renderDrawFeature = (arr) => {
  drawLayer && map.removeLayer(drawLayer)

  const vectorSource = new VectorSource({ wrapX: false })
  drawLayer = new VectorLayer({
    source: vectorSource,
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

  drawFeatures = []
  let featureTemp = null
  arr.forEach((item) => {
    featureTemp = generateDrawFeature(item)
    drawFeatures.push(featureTemp)
  })
  vectorSource.addFeatures(drawFeatures)
}

/**
 * 绘制图层渲染与销毁
 * @param {Boolean} isHide 是否显示
 */
export const destroyDrawLayer = (isHide) => {
  isHide ? map.removeLayer(drawLayer) : map.addLayer(drawLayer)
}

/**
 * 已绘制图形要素的添加与删除
 * @param {Number} idx 数据索引
 * @param {Boolean} isHide 是否显示
 */
export const removeDrawFeature = (idx, isHide) => {
  const feature = drawFeatures[idx]

  isHide
    ? drawLayer.getSource().removeFeature(feature)
    : drawLayer.getSource().addFeature(feature)
}

/**
 * 定位到图形要素
 * @param {number} idx 数据索引
 */
export const positionDrawFeature = (idx) => {
  // 获取地图视图 view
  const view = map.getView()
  const extent = drawFeatures[idx].getGeometry().getExtent()
  // 定位范围
  view.fit(extent, {
    duration: 1200 // 动画的持续时间
  })
}

/**
 * 绘制图形
 * @constant interaction 交互对象
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
  // 清除绘制对象
  drawLayer.getSource().removeFeature(featureTemp)
  // 清除交互对象
  if (interaction != undefined && interaction != null) {
    map.removeInteraction(interaction)
  }
}

/**
 * 渲染点位数据
 * @param {[]} points 点位集合
 */
let wsVectorLayer = null
export const renderWsPoints = (points) => {
  wsVectorLayer && map.removeLayer(wsVectorLayer)

  const vectorSource = new VectorSource({ wrapX: false })
  wsVectorLayer = new VectorLayer({
    source: vectorSource
  })
  map.addLayer(wsVectorLayer)

  let features = []
  points.forEach((item) => {
    let feature = new Feature({
      geometry: new Point(
        fromLonLat([
          Number(item.longitude) + 0.013,
          Number(item.latitude) - 0.167
        ])
      ),
      isws_point: item
    })
    feature.setStyle(
      new Style({
        image: new Icon({
          scale: 1.2,
          src: chooseTypeIcon(item.type)
        })
      })
    )
    features.push(feature)
  })
  vectorSource.addFeatures(features)
}

/**
 * 渲染鹰觉点位数据
 * @param {[]} points 点位集合
 */
let yjVectorLayer = null
export const renderYjPoints = (points) => {
  yjVectorLayer && map.removeLayer(yjVectorLayer)

  const vectorSource = new VectorSource({ wrapX: false })
  yjVectorLayer = new VectorLayer({
    source: vectorSource
  })
  map.addLayer(yjVectorLayer)

  let features = []
  points.forEach((item) => {
    let feature = new Feature({
      geometry: new Point(
        fromLonLat([Number(item.lon) + 0.013, Number(item.lat) - 0.167])
      ),
      isws_point: {
        name: item.name || ' ',
        length: item.len,
        course: item.cog,
        speed: item.sog,
        latitude: item.lat.toFixed(6),
        longitude: item.lon.toFixed(6),
        state: item.state,
        timestamp: item.ltm,
        mmsi: item.mmsi
      }
    })
    feature.setStyle(
      new Style({
        image: new Icon({
          scale: 1.2,
          src: chooseYjTypeIcon(item.stp)
        })
      })
    )
    features.push(feature)
  })
  vectorSource.addFeatures(features)
}

/**
 * ws点位和鹰觉点位数据
 * @param {[]} points 点位集合
 */
export const removePointsLayer = (isYj) => {
  isYj ? map.removeLayer(wsVectorLayer) : map.removeLayer(yjVectorLayer)
}

// 时间戳转换为时间
export const timestampToTime = (timestamp) => {
  timestamp = timestamp ? timestamp : null
  let date = new Date(timestamp) //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + '-'
  let M =
    (date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1) + '-'
  let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
  let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
  let m =
    (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
  let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  return Y + M + D + h + m + s
}

/**
 * 生成图形要素
 * @param {{}} item 图形要素信息
 * @returns 图形要素对象
 */
const generateDrawFeature = (item) => {
  let geometry
  switch (item.areaScopeType) {
    // 渲染面
    case 1:
      const pointsRes = item.areaScope.map((v) => fromLonLat(v))
      geometry = new Polygon([pointsRes])
      break
    // 渲染圆
    case 2:
      // 比例尺  单位 米
      // const metersPerUnit = map.getView().getProjection().getMetersPerUnit()
      // geometry = new Circle(
      //   fromLonLat(item.areaScope),
      //   item.radius / metersPerUnit
      // )
      geometry = new Circle(fromLonLat(item.areaScope), item.radius)
      break
    // 渲染点
    default:
      geometry = new Point(fromLonLat(item.areaScope))
  }
  let feature = new Feature({
    geometry: geometry
  })
  // 图形渲染样式
  feature.setStyle(
    new Style({
      stroke: new Stroke({
        width: 2,
        lineDash: item.areaOutsideStyle === 'dashed' ? [10, 10, 10, 10] : false,
        color: hexToRgba(item.areaOutsideColor, item.areaOutsideOpacity)
      }),
      fill: new Fill({
        color: hexToRgba(item.areaInsideColor, item.areaInsideOpacity)
      }),
      text: new Text({
        text: item.areaName,
        font: 'normal 14px 微软雅黑',
        fill: new Fill({
          color: '#000'
        })
      })
    })
  )
  return feature
}

// 根据条件渲染标记点图标
const chooseMarkerIcon = (item) => {
  let src = ''
  if (item.status === 0) {
    src = require('@/assets/image/marker_icon/4.png')
  } else if (item.alarmList?.length > 0) {
    src = require('@/assets/image/marker_icon/2.png')
  } else {
    src = require('@/assets/image/marker_icon/1.png')
  }
  return src
}

// 根据点位类型渲染点位图标
const chooseTypeIcon = (type) => {
  const obj = {
    AIS_A: require('@/assets/image/type_icon/aisA_1.bef82bfa.png'),
    AIS_B: require('@/assets/image/type_icon/aisB_1.fb51160f.png'),
    SIMULATION: require('@/assets/image/type_icon/Unknown.png'),
    RADAR: require('@/assets/image/type_icon/radar.png'),
    RADAR_AIS_A: require('@/assets/image/type_icon/aisAR_1.44fb1489.png'),
    RADAR_AIS_B: require('@/assets/image/type_icon/aisBR_1.8ca96264.png'),
    RADAR_AIS_A_PRESUMABLE: require('@/assets/image/type_icon/Unknown.png'),
    RADAR_AIS_B_PRESUMABLE: require('@/assets/image/type_icon/Unknown.png'),
    BDS: require('@/assets/image/type_icon/BD-1.0d2328f8.png'),
    GPS: require('@/assets/image/type_icon/Unknown.png'),
    AID: require('@/assets/image/type_icon/AID.5aa51bd8.png'),
    RADAR_AID: require('@/assets/image/type_icon/AIDR.19f67404.png'),
    VAID: require('@/assets/image/type_icon/VAID.a350fe21.png'),
    RADAR_VAID: require('@/assets/image/type_icon/VAIDR.06a8ef61.png'),
    duplicate_A: require('@/assets/image/type_icon/Unknown.png'),
    duplicate_B: require('@/assets/image/type_icon/Unknown.png')
  }
  return obj[type] || require('@/assets/image/type_icon/Unknown.png')
}

// 根据点位类型渲染鹰觉点位图标
const chooseYjTypeIcon = (stp) => {
  let src = ''
  switch (stp) {
    case 1 || 30 || 100 || 101:
      src = require('@/assets/image/yjtype_icon/leida.png')
      break
    case 10:
      src = require('@/assets/image/yjtype_icon/AIS_A.png')
      break
    case 20:
      src = require('@/assets/image/yjtype_icon/AIS_B.png')
      break
    case 11 || 110 || 111:
      src = require('@/assets/image/yjtype_icon/ld.AIS_A.png')
      break
    case 21 || 120 || 121:
      src = require('@/assets/image/yjtype_icon/ld.AIS_B.png')
      break
  }
  return src
}

// 偏移值转换
const conversion = (position) => {
  let cc = []
  position.forEach((item) => {
    cc.push(fromLonLat([Number(item[0]) + 0.013, Number(item[1]) - 0.17]))
  })
  return cc
}

// 将hex颜色转成rgb
const hexToRgba = (hex = '#445DA7', opacity = 50) => {
  let red = parseInt('0x' + hex.slice(1, 3))
  let green = parseInt('0x' + hex.slice(3, 5))
  let blue = parseInt('0x' + hex.slice(5, 7))
  opacity = opacity * 0.01

  return [red, green, blue, opacity]
}
