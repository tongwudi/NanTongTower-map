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
export const renderArea = () => {
  const vectorSource = new VectorSource()
  forbiddenLayer = new VectorLayer({
    // zIndex: 1,
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
    features.push(polygonFeature)
    // forbiddenLayer.getSource().addFeature(polygonFeature)
  })
  vectorSource.addFeatures(features)
}

/**
 * 切换禁区渲染与销毁
 * @param {Boolean} isHide 是否显示
 */
export const changeForbidden = (isHide) => {
  isHide ? map.removeLayer(forbiddenLayer) : map.addLayer(forbiddenLayer)
}

/**
 * 初始化绘制图层
 * @constant drawLayer 绘制图层
 */
let drawLayer = null
export const initDraw = () => {
  drawLayer = new VectorLayer({
    // zIndex: 1,
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
 * 渲染图形要素
 * @param {{}} item 图形要素信息集合
 */
export const renderDrawFeature = (arr) => {
  // 清除本地图形要素
  let features = []
  // 清除图层所有图形要素
  drawLayer.getSource().clear()

  const points = arr.reduce((cur, item) => {
    const areaScope = JSON.parse(item.areaScope)
    const curItem = areaScope.map((v) => {
      const { longitude, latitude } = v
      return [longitude, latitude]
    })
    cur.push({
      ...item,
      areaScope: item.areaScopeType === 1 ? curItem : curItem[0]
    })
    return cur
  }, [])

  let featureTemp = null
  points.forEach((item) => {
    featureTemp = generateDrawFeature(item)
    features.push(featureTemp)
  })
  drawLayer.getSource().addFeatures(features)
}

/**
 * 生成图形要素
 * @param {{}} item 图形要素信息
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
        font: 'normal 12px 微软雅黑',
        fill: new Fill({
          color: '#000'
        })
      })
    })
  )
  return feature
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
  // 清除已绘制对象
  drawLayer.getSource().removeFeature(featureTemp)
  // 关闭绘制功能
  if (interaction != undefined && interaction != null) {
    map.removeInteraction(interaction)
  }
}

/**
 * 渲染点位数据
 * @param {[]} points 点位集合
 */
let pointLayer = []
export const renderPoints = (points) => {
  pointLayer && map.removeLayer(pointLayer)

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
          src: chooseIcon(item.type)
        })
      })
    )
    features.push(feature)
  })
  pointLayer = new VectorLayer({
    source: new VectorSource({
      features: features
    })
  })
  map.addLayer(pointLayer)
}

/**
 * 渲染鹰觉点位数据
 * @param {[]} points 点位集合
 */
let yjVectorLayer = []
export const renderYjPoints = (points) => {
  yjVectorLayer && map.removeLayer(yjVectorLayer)

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
        latitude: item.lat,
        longitude: item.lon,
        state: item.state,
        timestamp: item.ltm,
        mmsi: item.mmsi
      }
    })
    feature.setStyle(
      new Style({
        image: new Icon({
          scale: 1.2,
          src: chooseIcon(item.type)
        })
      })
    )
    features.push(feature)
  })
  yjVectorLayer = new VectorLayer({
    source: new VectorSource({
      features: features
    })
  })
  map.addLayer(yjVectorLayer)
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

// 根据点位类型渲染点位图标
const chooseIcon = (type) => {
  const obj = {
    AIS_A: require('../assets/type_ico/aisA_1.bef82bfa.png'),
    AIS_B: require('../assets/type_ico/aisB_1.fb51160f.png'),
    SIMULATION: require('../assets/type_ico/Unknown-1.6cd8918e.png'),
    RADAR: require('../assets/type_ico/radar.2c6e4e03.png'),
    RADAR_AIS_A: require('../assets/type_ico/aisAR_1.44fb1489.png'),
    RADAR_AIS_B: require('../assets/type_ico/aisBR_1.8ca96264.png'),
    RADAR_AIS_A_PRESUMABLE: require('../assets/type_ico/Unknown-1.6cd8918e.png'),
    RADAR_AIS_B_PRESUMABLE: require('../assets/type_ico/Unknown-1.6cd8918e.png'),
    BDS: require('../assets/type_ico/BD-1.0d2328f8.png'),
    GPS: require('../assets/type_ico/Unknown-1.6cd8918e.png'),
    AID: require('../assets/type_ico/AID.5aa51bd8.png'),
    RADAR_AID: require('../assets/type_ico/AIDR.19f67404.png'),
    VAID: require('../assets/type_ico/VAID.a350fe21.png'),
    RADAR_VAID: require('../assets/type_ico/VAIDR.06a8ef61.png'),
    duplicate_A: require('../assets/type_ico/Unknown-1.6cd8918e.png'),
    duplicate_B: require('../assets/type_ico/Unknown-1.6cd8918e.png')
  }
  return obj[type] || require('../assets/type_ico/Unknown-1.6cd8918e.png')
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
