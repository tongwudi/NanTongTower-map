const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  // devServer: {
  //   proxy: {
  //     '/api': {
  //       target: process.env.VUE_APP_API,
  //       changeOrigin: false, // 为true时，发送请求头中的host会设置成target。为false，则不变。默认为true
  //       pathRewrite: { '^/api': '/' } // 发送请求时，请求路径重写：将 /a/xxx --> /xxx （去掉/a）
  //     }
  //   }
  // }
})
