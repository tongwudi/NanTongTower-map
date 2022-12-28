import request from '@/utils/request'

// 获取token
export const getMapToken = () =>
  request.get(process.env.VUE_APP_API + '/monitor/getMapToken')

// 获取标记点
export const getMarkerPoint = () =>
  request.get(process.env.VUE_APP_API + '/monitor/mapPointInfo2', {
    hasToken: true
  })

// 列表
export const getPage = (url, params) =>
  request.get(process.env.VUE_APP_API + url, { params })

// 保存绘制区域
export const saveArea = (data) =>
  request.post(process.env.VUE_APP_API + '/alarmInfo/areaSave', data)

// 获取船名
export const getShipName = (params) =>
  request.get('http://cjyp.js.uniseas.com.cn:11080/api/target/ais/info', {
    params
  })

// 获取鹰觉点位
// export const getByRegion = () =>
//   request.get(
//     'http://221.181.113.142:32187/target/getByRegion?minLon=120.0551420838862&minLat=31.197246498871603&maxLon=122.46518797049585&maxLat=32.67199009043264&zoom=14'
//   )
export const getByRegion = () =>
  request.get(process.env.VUE_APP_API + '/alarmInfo/getRadarInfo')
